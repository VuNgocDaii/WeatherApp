import { Injectable } from '@angular/core';
import { Day } from '../model/day';
import { DayTree,treeItem } from '../share/utils/day-util';
import { STORAGE_DAY } from '../share/constants/constans';
@Injectable({
  providedIn: 'root',
})
export class DayService {

  saveTreeToLocal(tree: DayTree) {
    console.log('SAVE TIME')
    const dump = tree.dump();
    localStorage.setItem(STORAGE_DAY, JSON.stringify(dump));
  }

  loadTreeFromLocal(): DayTree {
    const tree = new DayTree();
    const json = localStorage.getItem(STORAGE_DAY);
    if (!json) return tree;

    try {
      const dump = JSON.parse(json) as treeItem[];
      if (Array.isArray(dump)) {
        dump.sort((a, b) => a.key - b.key);
        tree.loadFromDump(dump);
      }
    } catch { }
    return tree;
  }

}
