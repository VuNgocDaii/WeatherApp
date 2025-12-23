import { Hour } from "../../model/hour";
import { isDayTime } from "./date-util";
import { HourDTO } from "./date-util";
import { toDate } from "./date-util";
export class Node {
  key: number;
  values: Hour[];
  height: number = 1;
  left: Node | null = null;
  right: Node | null = null;

  constructor(key: number, first: Hour) {
    this.key = key;
    this.values = [first];
  }
}

export class HourTree {
  root: Node | null = null;

  clear() {
    this.root = null;
  }

  insert(key: number, value: Hour) {
    this.root = this._insert(this.root, key, value);
  }

  toArray(): Hour[] {
    const out: Hour[] = [];
    const dfs = (n: Node | null) => {
      if (!n) return;
      dfs(n.left);
      out.push(...n.values);
      dfs(n.right);
    };
    dfs(this.root);
    return out;
  }

  h(n: Node | null): number {
    return n ? n.height : 0;
  }

  upd(n: Node) {
    n.height = Math.max(this.h(n.left), this.h(n.right)) + 1;
  }

  bf(n: Node): number {
    return this.h(n.left) - this.h(n.right);
  }

  rotR(y: Node): Node {
    const x = y.left!;
    const t2 = x.right;

    x.right = y;
    y.left = t2;

    this.upd(y);
    this.upd(x);
    return x;
  }

  rotL(x: Node): Node {
    const y = x.right!;
    const t2 = y.left;

    y.left = x;
    x.right = t2;

    this.upd(x);
    this.upd(y);
    return y;
  }

  rebalance(n: Node): Node {
    this.upd(n);
    const b = this.bf(n);

    if (b > 1) {
      // LR
      if (this.bf(n.left!) < 0) n.left = this.rotL(n.left!);
      //LL
      return this.rotR(n);
    }

    if (b < -1) {
      //RL
      if (this.bf(n.right!) > 0) n.right = this.rotR(n.right!);
      //RR
      return this.rotL(n);
    }

    return n;
  }

  _insert(node: Node | null, key: number, value: Hour): Node {
    if (!node) return new Node(key, value);

    if (key < node.key) node.left = this._insert(node.left, key, value);
    else if (key > node.key) node.right = this._insert(node.right, key, value);
    else {
      node.values.push(value);
      return node;
    }

    return this.rebalance(node);
  }

  hourKey(time: any): number {
    const d = toDate(time) ?? new Date();
    const k = new Date(d);
    k.setMinutes(0, 0, 0);
    return k.getTime();
  }

}
