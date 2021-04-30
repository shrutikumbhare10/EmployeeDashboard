import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { EmployeeService, IEmployee } from '../employee-service/employee.service';
import * as _ from 'lodash';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, AfterViewInit {

  employeesData: any[] = [];
  employeeTableColumns: string[] = ["srNo", "name", "department", "joiningDate"];
  deptCountTableColumns: string[] = ["dept", "count"];
  showDeptCount: boolean = false;
  deptwiseCount: any[] = [];
  employeeTableData = new MatTableDataSource(this.employeesData);

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.filteringColumns();
  }

  ngAfterViewInit() {
    this.employeeTableData.sort = this.sort;
  }

  initialize() {
    this.employeeService.getEmployeesData().subscribe((res: []) => {
      this.employeesData = res;
    });
    _.map(this.employeesData, (employee, index) => {
      employee.serialNo = index + 1;
    })
    this.employeeTableData.data = this.employeesData;
  }

  filteringColumns() {
    this.employeeTableData.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter)
    }
  }

  searchByName(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.employeeTableData.filter = filterValue.trim().toLocaleLowerCase();
  }

  getDepartments() {
    this.showDeptCount = !this.showDeptCount;
    this.deptwiseCount = [];
    const allDept = _.map(this.employeesData, (emp) => emp.department);
    const uniqueDepts = _.uniq(allDept);

    uniqueDepts.forEach(dept => {
      let count = 0;
      _.filter(allDept, (department) => {
        count = dept === department ? count + 1 : count;
      })
      this.deptwiseCount.push({ dept: [dept], count: count })
    })
    console.log('deptWise', this.deptwiseCount)
  }

  removeDepartment() {
    this.employeeTableData.data = this.employeeTableData.data.filter(function (employee) {
      return employee.department != 'Development';
    })
    console.log(this.employeeTableData.data);

  }

  getDateDiff() {
    this.employeeTableData.data.forEach((employee: IEmployee) => {

      // converting date with 'dd-mm-yyyy' format into 'mm-dd-yyyy' format
      const empDate = employee.joining_date.split('/');
      const convertedEmpDate = empDate[1] + '/' + empDate[0] + '/' + empDate[2];

      const requiredDate = new Date(convertedEmpDate);
      const today = new Date();

      // No. of days for 2 yrs: 365 * 2 = 730
      if (Math.abs(+today - +requiredDate) / (1000 * 60 * 60 * 24) < 730) {
        this.employeeTableData.data = this.employeeTableData.data.filter(function (ele) {
          return ele.id != employee.id;
        })
      }
    })
    this.cdr.detectChanges();
  }

  getOriginalData() {
    this.employeeTableData.data = this.employeesData;
  }

}
