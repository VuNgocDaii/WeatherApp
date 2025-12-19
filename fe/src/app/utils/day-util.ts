import { Injectable } from '@angular/core';
import { Day } from '../model/day';
export type DayDTO = {
  time: string;
  cityId: number;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
  maxWindSpeed: number;
};


export type treeItem = {
  key: number;
  days: DayDTO[];
}

type Tree = treeItem[];
type CityMap = Map<number, Day>;

class Node {
  key: number;
  value: CityMap;
  height: number = 1;
  left: Node | null = null;
  right: Node | null = null;

  constructor(key: number, value?: CityMap) {
    this.key = key;
    this.value = value ?? new Map<number, Day>();
  }
}
function toDTO(d: Day): DayDTO {
    return {
      time: d.time.toISOString(),
      cityId: d.cityId,
      weatherCode: d.weatherCode,
      maxTemp: d.maxTemp,
      minTemp: d.minTemp,
      sunrise: d.sunrise.toISOString(),
      sunset: d.sunset.toISOString(),
      maxWindSpeed: d.maxWindSpeed,
    };
  }

function fromDTO(x: DayDTO): Day {
    return new Day(
      new Date(x.time),
      x.cityId,
      x.weatherCode,
      x.maxTemp,
      x.minTemp,
      new Date(x.sunrise),
      new Date(x.sunset),
      x.maxWindSpeed
    );
  }

function normalizeDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function dateInt(d: Date): number {
  let y = d.getFullYear();
  let m = d.getMonth() + 1;
  let dd = d.getDate();
  return y * 10000 + m * 100 + dd;
}
///
function h(n: Node | null) { return n ? n.height : 0; }
function update(n: Node) { n.height = Math.max(h(n.left), h(n.right)) + 1; }
function bf(n: Node) { return h(n.left) - h(n.right); }

function rotateRight(y: Node): Node {
  const x = y.left!;
  const t2 = x.right;

  x.right = y;
  y.left = t2;

  update(y);
  update(x);
  return x;
}

function rotateLeft(x: Node): Node {
  const y = x.right!;
  const t2 = y.left;

  y.left = x;
  x.right = t2;

  update(x);
  update(y);
  return y;
}

function rebalance(n: Node): Node {
  update(n);
  const b = bf(n);
  if (b > 1) {
    if (bf(n.left!) < 0) n.left = rotateLeft(n.left!);
    return rotateRight(n);
  }
  if (b < -1) {
    if (bf(n.right!) > 0) n.right = rotateRight(n.right!);
    return rotateLeft(n);
  }
  return n;
}
///
export class DayTree {
  private root: Node | null = null;

  upsert(day: Day) {
    day.time = normalizeDay(day.time);
    this.root = this._insertOrUpdate(this.root, dateInt(day.time), day);
  }

  private _insertOrUpdate(node: Node | null, key: number, day: Day): Node {
    if (!node) {
      const n = new Node(key);
      n.value.set(day.cityId, day);
      return n;
    }

    if (key < node.key) node.left = this._insertOrUpdate(node.left, key, day);
    else if (key > node.key) node.right = this._insertOrUpdate(node.right, key, day);
    else {
      node.value.set(day.cityId, day);
      return node;
    }

    return rebalance(node);
  }

  get(dayOnly: Date, cityId: number): Day | undefined {
    const k = dateInt(normalizeDay(dayOnly));
    let cur = this.root;
    while (cur) {
      if (k < cur.key) cur = cur.left;
      else if (k > cur.key) cur = cur.right;
      else return cur.value.get(cityId);
    }
    return undefined;
  }

  getAllInDate(dayOnly: Date): Day[] {
    const k = dateInt(normalizeDay(dayOnly));
    const node = this._findNode(k);
    return node ? Array.from(node.value.values()) : [];
  }

  private _findNode(key: number): Node | null {
    let cur = this.root;
    while (cur) {
      if (key < cur.key) cur = cur.left;
      else if (key > cur.key) cur = cur.right;
      else return cur;
    }
    return null;
  }

  rangeByCity(cityId: number, from: Date, to: Date): Day[] {
    const a = dateInt(normalizeDay(from));
    const b = dateInt(normalizeDay(to));
    const out: Day[] = [];

    this._range(this.root, a, b, (node) => {
      const d = node.value.get(cityId);
      if (d) out.push(d);
    });

    return out;
  }

  rangeAll(from: Date, to: Date): Day[] {
    const a = dateInt(normalizeDay(from));
    const b = dateInt(normalizeDay(to));
    const out: Day[] = [];

    this._range(this.root, a, b, (node) => out.push(...node.value.values()));
    return out;
  }

  private _range(node: Node | null, a: number, b: number, visit: (n: Node) => void) {
    if (!node) return;
    if (a < node.key) this._range(node.left, a, b, visit);
    if (a <= node.key && node.key <= b) visit(node);
    if (node.key < b) this._range(node.right, a, b, visit);
  }

  dump(): Tree {
    const out: Tree = [];
    this._inorder(this.root, (node) => {
      out.push({
        key: node.key,
        days: Array.from(node.value.values()).map(toDTO),
      });
    });
    return out;
  }

  private _inorder(node: Node | null, visit: (n: Node) => void) {
    if (!node) return;
    this._inorder(node.left, visit);
    visit(node);
    this._inorder(node.right, visit);
  }

  loadFromDump(dump: Tree) {
    this.root = this._buildBalanced(dump, 0, dump.length - 1);
  }

  private _buildBalanced(arr: Tree, l: number, r: number): Node | null {
    if (l > r) return null;

    const mid = (l + r) >> 1;
    const item = arr[mid];

    const node = new Node(item.key);

    for (const dto of item.days) {
      const day = fromDTO(dto);
      day.time = normalizeDay(day.time);
      node.value.set(day.cityId, day);
    }

    node.left = this._buildBalanced(arr, l, mid - 1);
    node.right = this._buildBalanced(arr, mid + 1, r);

    update(node);
    return node;
  }

  getMaxKey(): number | null {
    if (!this.root) return null;
    let cur = this.root;
    while (cur.right) cur = cur.right;
    return cur.key;
  }

  keyToLocalDate(key: number): Date {
  const y = Math.floor(key / 10000);
  const m = Math.floor((key % 10000) / 100);
  const d = key % 100;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

  getMaxDate(): Date | null {
    const k = this.getMaxKey();
    if (k == null) return null;
    return this.keyToLocalDate(k);
  }
}
@Injectable({
  providedIn: 'root',
})

export class DayUtil {
  

}
