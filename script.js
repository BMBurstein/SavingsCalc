'use strict';

var plansCounter = 0;

function addGoal() {
  const table = document.getElementById('goals').tBodies[0];
  const tr = table.insertRow();
  let td = tr.insertCell();
  td.innerHTML = '<input type="text" name="goalName" placeholder="מטרה">';
  td = tr.insertCell();
  td.innerHTML = '<input type="number" name="goalYear" class="defaultYear" placeholder="שנה" min="2020">';
  td = tr.insertCell();
  td.innerHTML = '<input type="number" name="goalAmt" placeholder="סכום" min="0">';
  td = tr.insertCell();
  td.innerHTML = '<input type="button" value="X" onclick="removeRow(this)">';
}

function addPlan() {
  const currentYear = new Date().getFullYear();
  const table = document.getElementById('plans').tBodies[0];
  const tr = table.insertRow();
  let td = tr.insertCell();
  td.innerHTML = `<input type="text" name="planName" placeholder="תוכנית" value="${"תוכנית #" + ++plansCounter}">`;
  td = tr.insertCell();
  td.innerHTML = `<input type="number" name="startYear" placeholder="שנת התחלה" min="2020" value="${currentYear}">`;
  td = tr.insertCell();
  td.innerHTML = '<input type="number" name="startAmt" placeholder="סכום ראשוני" min="0">';
  td = tr.insertCell();
  td.innerHTML = '<input type="number" name="contribAmt" placeholder="הפקדה חודשית" min="0">';
  td = tr.insertCell();
  td.innerHTML = '<input type="number" name="interestRate" placeholder="ריבית שנתית" min="0" step=".01">';
  td = tr.insertCell();
  td.innerHTML = '<input type="checkbox" name="showPlan" checked>';
  td = tr.insertCell();
  td.innerHTML = '<input type="button" value="X" onclick="removeRow(this)">';
}

function removeRow(btn) {
  btn.closest("table").deleteRow(btn.closest("tr").rowIndex);
}

function showGraph() {
  const goalsArr = [];  
  const goalsTable = document.getElementById('goals').tBodies[0];
  for(let row of goalsTable.rows) {
    const goal = {};
    goal.name = row.cells[0].firstElementChild.value;
    goal.year = row.cells[1].firstElementChild.valueAsNumber;
    goal.amt = row.cells[2].firstElementChild.valueAsNumber;
    if (goal.year && goal.amt) {
      goalsArr.push(goal);
    }
  }
  if (goalsArr.length == 0) {
    alert("Need at least one goal");
    return;
  }
  goalsArr.sort((a, b) => { return a.year - b.year; });
  const goals = new Map();
  for (const goal of goalsArr) {
    const year = goal.year;
    if (!goals.has(goal.year)) {
      goals.set(year, {});
      goals.get(year).amt = goal.amt;
      goals.get(year).name = goal.name;
    } else {
      goals.get(year).amt += goal.amt;
      goals.get(year).name += ", ";
      goals.get(year).name += goal.name;
    }
  }

  const plans = [];
  const plansTable = document.getElementById('plans').tBodies[0];
  for (const row of plansTable.rows) {
    if (!row.cells[5].firstElementChild.checked) continue;
    const plan = {};
    plan.name = row.cells[0].firstElementChild.value;
    plan.year = row.cells[1].firstElementChild.valueAsNumber;
    plan.amount = row.cells[2].firstElementChild.valueAsNumber;
    plan.contrib = row.cells[3].firstElementChild.valueAsNumber;
    plan.rate = row.cells[4].firstElementChild.valueAsNumber;
    if (goalsArr[0].year < plan.year) {
      alert("Cannot meet goals before plan starts");
      return;
    }
    plans.push(plan);
  }
  if (plans.length == 0) {
    alert("Need at least one plan");
    return;
  }
  plans.sort((a, b) => { return a.year - b.year; });

  const startYear = plans[0].year;
  const endYear = goalsArr[goalsArr.length - 1].year + 1;

  const data = [["Year"]];
  for (let i = 0; i < plans.length; i++) {
    data[0].push(plans[i].name);
  }
  for (let i = startYear; i <= endYear; i++) {
    const rowData = [i.toString()];
    if (goals.has(i)) rowData[0] += '(' + goals.get(i).name + ')';
    for (let j = 0; j < plans.length; j++) {
      const plan = plans[j];
      let val = 0;
      if (plan.year > i) {
        val = undefined;
      }
      else if (plan.year == i) {
        val = plan.amount;
      }
      else {
        const monthlyRate = plan.rate / 100 / 12;
        val = data[data.length - 1][j + 1];
        val *= (1 + monthlyRate) ** 12;
        val += plan.contrib * (monthlyRate ? ((1 + monthlyRate) ** 12 - 1) / monthlyRate : 12);
      }
      if (goals.has(i)) val -= goals.get(i).amt;
      rowData.push(val);
    }
    data.push(rowData);
  }

  const chartData = google.visualization.arrayToDataTable(data, false);
  const options = {};
  const chart = new google.visualization.LineChart(document.getElementById('chart'));
  chart.draw(chartData, options);
}

// startup code
addGoal();
addPlan();


const form = document.getElementById("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  showGraph();
});
