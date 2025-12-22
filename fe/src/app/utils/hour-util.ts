import { Hour } from '../model/hour';

export type HourDTO = {
  time: string;
  cityId: number;
  temp: number;
  apparentTemp: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  icon: string;
};


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
      if (this.bf(n.left!) < 0) n.left = this.rotL(n.left!);
      return this.rotR(n);
    }

    if (b < -1) {
      if (this.bf(n.right!) > 0) n.right = this.rotR(n.right!);
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

  toDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);

    if (typeof value === 'string') {
      if (value.includes('T')) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
      }

      const m = value.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
      );
      if (m) {
        const [, y, mo, da, hh, mi, ss] = m;
        return new Date(+y, +mo - 1, +da, +hh, +mi, +(ss ?? 0));
      }
    }
    return null;
  }

  isDayTime(time: any): boolean {
    const d = this.toDate(time);
    if (!d) return true;
    const h = d.getHours();
    return h >= 6 && h < 18;
  }

  hourKey(time: any): number {
    const d = this.toDate(time) ?? new Date();
    const k = new Date(d);
    k.setMinutes(0, 0, 0);
    return k.getTime();
  }

  toDTO(h: Hour): HourDTO {
    const d = this.toDate((h as any).time) ?? new Date();
    return {
      time: d.toISOString(),
      cityId: (h as any).cityId,
      temp: (h as any).temp,
      apparentTemp: (h as any).apparentTemp,
      weatherCode: (h as any).weatherCode,
      humidity: (h as any).humidity,
      windSpeed: (h as any).windSpeed,
      icon: (h as any).icon,
    };
  }

  fromDTO(dto: any, fallbackIcon: (code: number, isDay: boolean) => string): Hour | null {
    const t = this.toDate(dto?.time);
    if (!t) return null;

    const code = Number(dto.weatherCode ?? 0);
    const icon = String(dto.icon ?? fallbackIcon(code, this.isDayTime(t)));

    return new Hour(
      t,
      Number(dto.cityId ?? 0),
      Number(dto.temp ?? 0),
      Number(dto.apparentTemp ?? 0),
      code,
      Number(dto.humidity ?? 0),
      Number(dto.windSpeed ?? 0),
      icon
    );
  }
}
