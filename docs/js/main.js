import { getStudentsList, addStudent, deleteStudent } from './api.js';

// Глобальная переменная для индикатора загрузки
let loadingIndicator;
let errorAlertDiv;

// --- UI: Индикатор загрузки ---
function createLoadingSpinner() {
  loadingIndicator = document.createElement('div');
  loadingIndicator.classList.add('loading-indicator', 'position-fixed', 'start-0', 'top-0', 'z-index-1', 'w-100', 'h-100');
  loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  loadingIndicator.style.display = 'none';
  loadingIndicator.style.justifyContent = 'center';
  loadingIndicator.style.alignItems = 'center';

  const spinner = document.createElement('div');
  spinner.classList.add('spinner-border', 'text-primary');
  spinner.setAttribute('role', 'status');
  spinner.style.width = '3rem';
  spinner.style.height = '3rem';

  const span = document.createElement('span');
  span.classList.add('visually-hidden');
  span.textContent = 'Загрузка...';

  spinner.appendChild(span);
  loadingIndicator.appendChild(spinner);
  document.body.appendChild(loadingIndicator);
}

function showLoadingSpinner() {
  if (loadingIndicator) loadingIndicator.style.display = 'flex';
}
function hideLoadingSpinner() {
  if (loadingIndicator) loadingIndicator.style.display = 'none';
}

// --- UI: Ошибки ---
function showErrorAlert(message) {
  if (!errorAlertDiv) return;
  errorAlertDiv.textContent = message;
  errorAlertDiv.style.display = 'block';
  setTimeout(() => {
    errorAlertDiv.style.display = 'none';
  }, 4000);
}

// --- Инициализация UI ---
createLoadingSpinner();
errorAlertDiv = document.getElementById('error-alert');

let studentsList = [];

// --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
(async function initStudentApp() {
  showLoadingSpinner();
  try {
    const serverData = await getStudentsList();
    studentsList = serverData || [];
    renderStudentTable();
  } catch {
    showErrorAlert('Ошибка загрузки данных студентов. Попробуйте обновить страницу позже.');
  } finally {
    hideLoadingSpinner();
  }
})();

// Создание элементов
const form = document.getElementById('form'),
  surnameInp = document.getElementById('input__surname'),
  nameInp = document.getElementById('input__name'),
  lastnameInp = document.getElementById('input__lastname'),
  ageInp = document.getElementById('input__birthday'),
  studyStartInp = document.getElementById('input__study-start'),
  facultyInp = document.getElementById('input__faculty'),

  filterForm = document.getElementById('filter-form'),
  filterFio = document.getElementById('filter-form__fio'),
  filterFaculty = document.getElementById('filter-form__faculty'),
  filterStart = document.getElementById('filter-form__start'),
  filterFinal = document.getElementById('filter-form__final');

function formatDate(date) {
  let dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  let yy = date.getFullYear();
  if (yy < 10) yy = '0' + yy;

  return dd + '.' + mm + '.' + yy;
};

function getAge(studentObj) {
  if (!(studentObj.birthday instanceof Date)) {
    studentObj.birthday = new Date(studentObj.birthday);
  }

  const today = new Date();
  let age = today.getFullYear() - studentObj.birthday.getFullYear();

  const isBirthdayPassed =
    today.getMonth() > studentObj.birthday.getMonth() ||
    (today.getMonth() === studentObj.birthday.getMonth() && today.getDate() >= studentObj.birthday.getDate());

  if (!isBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function calculateStudyFinal(studentObj) {
  return Number(studentObj.studyStart) + 4;
}

function calculateCurrentCourse(studentObj) {
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth() + 1;

  // Преобразуем studyStart в число
  let studyStart = Number(studentObj.studyStart);
  let studyFinal = calculateStudyFinal(studentObj);

  if (currentYear > studyFinal || (currentYear === studyFinal && currentMonth >= 9)) {
    return 'Окончание учебы';
  }

  const currentCourse = currentYear - studyStart + (currentMonth >= 9 ? 1 : 0);
  return `${currentCourse} курс`;
}

// --- Рендер таблицы студентов ---
async function renderStudentTable(sortProp = null, customList = null) {
  const studentsTable = document.getElementById('students-list');
  studentsTable.innerHTML = '';

  let studentsArray = [...(customList || studentsList)];
  studentsArray = studentsArray.filter(student => student && student.surname && student.name && student.lastname);

  let sortedStudentsArray = [...studentsArray];
  if (sortProp) sortStudentsArray(sortedStudentsArray, sortProp);
  if (studentsArray.length === 0 && studentsList.length === 0) {
    studentsTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет данных для отображения</td></tr>';
    return;
  }

  for (let student of studentsArray) {
    student.fio = student.surname + ' ' + student.name + ' ' + student.lastname;
    student.birthday = new Date(student.birthday);
    student.studyFinal = Number(student.studyStart + 4);
  }

  if (filterFio.value.trim() !== '') {
    filterFio.value = filterFio.value.replace(/[a-zа-я]+/gi, (match) => match[0].toUpperCase() + match.substr(1));
    studentsArray = filterStudentsArray(studentsArray, 'fio', filterFio.value.trim());
  }
  if (filterFaculty.value.trim() !== '') {
    checkFirstLetter(filterFaculty);
    studentsArray = filterStudentsArray(studentsArray, 'faculty', filterFaculty.value.trim());
  }
  if (filterStart.value.trim() !== '') studentsArray = filterStudentsArray(studentsArray, 'studyStart', filterStart.value.trim());
  if (filterFinal.value.trim() !== '') studentsArray = filterStudentsByFinalYear(studentsArray, filterFinal.value.trim());

  for (let studentObj of studentsArray) {
    const newTR = createStudentRow(studentObj);
    studentsTable.append(newTR);
  }
}

// --- Создание строки таблицы ---
function createStudentRow(studentObj) {
  if (!studentObj || !studentObj.surname || !studentObj.name || !studentObj.lastname) {
    return document.createElement('tr');
  }

  const tr = document.createElement('tr');
  const tdFIO = document.createElement('td');
  const tdBirthday = document.createElement('td');
  const tdStudyStart = document.createElement('td');
  const tdFaculty = document.createElement('td');
  const tdDelete = document.createElement('td');
  const btnDelete = document.createElement('button');

  btnDelete.classList.add('btn', 'btn-danger', 'w-100');
  btnDelete.textContent = 'Удалить';

  tdFIO.textContent = `${studentObj.surname} ${studentObj.name} ${studentObj.lastname}`;
  tdBirthday.textContent = `${formatDate(new Date(studentObj.birthday))} (${getAge(studentObj)} лет/года) `;

  const studyFinal = calculateStudyFinal(studentObj);
  const currentCourse = calculateCurrentCourse(studentObj);
  tdStudyStart.textContent = `${studentObj.studyStart} - ${studyFinal} (${currentCourse})`;

  if (currentCourse === 'Окончание учебы') {
    tdStudyStart.classList.add('text-danger');
  }
  tdFaculty.textContent = studentObj.faculty;

  btnDelete.addEventListener('click', async () => {
    const originText = btnDelete.textContent;
    btnDelete.disabled = true;
    showLoadingSpinner();
    btnDelete.textContent = 'Удаление...';

    try {
      await deleteStudent(studentObj.id);
      studentsList = await getStudentsList();
      renderStudentTable();
    } catch {
      showErrorAlert('Ошибка при удалении студента. Проверьте соединение с сервером.');
    } finally {
      btnDelete.textContent = originText;
      btnDelete.disabled = false;
      hideLoadingSpinner();
    }
  });
  tdDelete.append(btnDelete);

  tr.append(tdFIO, tdBirthday, tdStudyStart, tdFaculty, tdDelete);
  tr.classList.add('table__row');
  return tr;
}

// --- Сортировка ---
let changeSort = true;

function sortStudentsArray(studentsArray, prop) {
  return studentsArray.sort((a, b) => {
    const aValue = a[prop];
    const bValue = b[prop];

    // Сортировка чисел
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return changeSort ? aValue - bValue : bValue - aValue;
    }

    // Сортировка строк
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return changeSort
        ? aValue.localeCompare(bValue, 'ru', { sensitivity: 'base' })
        : bValue.localeCompare(aValue, 'ru', { sensitivity: 'base' });
    }

    // Сортировка дат
    if (aValue instanceof Date && bValue instanceof Date) {
      return changeSort ? aValue - bValue : bValue - aValue;
    }

    // Если типы данных не совпадают или не поддерживаются
    return 0;
  });
}

// --- Фильтрация ---
function filterStudentsArray(studentsArray, prop, value) {
  return studentsArray.filter(item => String(item[prop]).toLowerCase().includes(value.toLowerCase()));
}
function filterStudentsByFinalYear(studentsArray, finalYear) {
  return studentsArray.filter(student => {
    const studyFinal = Number(student.studyStart) + 4;
    return studyFinal === Number(finalYear);
  });
}

// --- Валидация ---
function checkFirstLetter(input) {
  if (input.value !== '') {
    return input.value = input.value[0].toUpperCase() + input.value.slice(1);
  }
}

// --- События формы и фильтров ---
surnameInp.addEventListener('input', () => { checkFirstLetter(surnameInp); });
nameInp.addEventListener('input', () => { checkFirstLetter(nameInp); });
lastnameInp.addEventListener('input', () => { checkFirstLetter(lastnameInp); });
facultyInp.addEventListener('input', () => { checkFirstLetter(facultyInp); });

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const birthday = new Date(ageInp.value.trim());
  if (isNaN(birthday.getTime())) {
    showErrorAlert('Введите корректную дату рождения.');
    return;
  }

  const studyStart = parseInt(studyStartInp.value.trim(), 10);
  if (isNaN(studyStart) || studyStart < 2015 || studyStart > new Date().getFullYear()) {
    showErrorAlert('Введите корректный год начала обучения.');
    return;
  }

  showLoadingSpinner();

  try {
    let newStudentObj = {
      surname: surnameInp.value.trim(),
      name: nameInp.value.trim(),
      lastname: lastnameInp.value.trim(),
      birthday: birthday,
      studyStart: String(studyStart),
      faculty: facultyInp.value.trim()
    };
    await addStudent(newStudentObj);
    studentsList = await getStudentsList();
    renderStudentTable();
    form.reset();
  } catch {
    showErrorAlert('Ошибка при добавлении студента. Проверьте соединение с сервером.');
  } finally {
    hideLoadingSpinner();
  }
});

document.getElementById('sort__fio').addEventListener('click', () => {
  sortStudentsArray(studentsList, 'surname');
  changeSort = !changeSort;
  renderStudentTable('surname');
});
document.getElementById('sort__birth').addEventListener('click', () => {
  sortStudentsArray(studentsList, 'birthday');
  changeSort = !changeSort;
  renderStudentTable('birthday');
});
document.getElementById('sort__study').addEventListener('click', () => {
  sortStudentsArray(studentsList, 'studyStart');
  changeSort = !changeSort;
  renderStudentTable('studyStart');
});
document.getElementById('sort__faculty').addEventListener('click', () => {
  sortStudentsArray(studentsList, 'faculty');
  changeSort = !changeSort;
  renderStudentTable('faculty');
});

filterForm.addEventListener('submit', function (e) {
  e.preventDefault();
  renderStudentTable(studentsList);
});
filterFio.addEventListener('input', () => { renderStudentTable(studentsList); });
filterFaculty.addEventListener('input', () => { renderStudentTable(studentsList); });
filterStart.addEventListener('input', () => { renderStudentTable(studentsList); });
filterFinal.addEventListener('input', () => {
  const finalYear = filterFinal.value.trim();
  const filteredStudents = filterStudentsByFinalYear(studentsList, finalYear);
  renderStudentTable(filteredStudents);
});
