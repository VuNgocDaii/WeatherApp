
import { Component, OnInit } from '@angular/core';
import { Day } from '../../model/day';
import { DayTree } from '../../utils/day-util';
import { DayService } from '../../service/day-service';
import { STORAGE_CITY } from '../../share/constants/constans';
import { City } from '../../model/city';
import { json } from 'stream/consumers';
import { RouterModule } from '@angular/router';
import {Router} from '@angular/router';
@Component({
  selector: 'app-side-bar',
  imports: [RouterModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})

export class SideBar implements OnInit {
  constructor(private dayService: DayService,private router:Router) { }

  async ngOnInit(): Promise<void> {
  }
}

