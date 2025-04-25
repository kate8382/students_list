(async () => {
  'use strict';
  // 1.
  async function getStudentsList() {
    try {
      let response = await fetch('http://localhost:3000/api/students', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      let data = await response.json();
      console.log('Данные с сервера:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при получении списка студентов:', error);
      alert('Не удалось загрузить список студентов. Попробуйте позже.');
      return [];
    }
  }

  async function addStudent(obj) {
    try {
      let response = await fetch('http://localhost:3000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      let data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при добавлении студента:', error);
      alert('Не удалось добавить студента. Проверьте данные и попробуйте снова.');
      throw error;
    }
  }

  async function deleteStudent(id) {
    try {
      let response = await fetch(`http://localhost:3000/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      let data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при удалении студента:', error);
      alert('Не удалось удалить студента. Попробуйте позже.');
      throw error;
    }
  }

  let serverData = await getStudentsList();
  let studentsList = [];
  if (serverData) {
    studentsList = serverData;
  }

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

    let currentYear = new Date().getFullYear();
    let studentAge = currentYear - studentObj.birthday.getFullYear();

    return studentAge;
  };

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

  // 2.
  function getStudentItem(studentObj) {
    if (!studentObj || !studentObj.surname || !studentObj.name || !studentObj.lastname) {
      console.error('Некорректные данные студента:', studentObj);
      return document.createElement('tr'); // Возвращаем пустую строку таблицы
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
    };
    tdFaculty.textContent = studentObj.faculty;

    btnDelete.addEventListener('click', async () => {
      await deleteStudent(studentObj.id);
      studentsList = studentsList.filter((item) => item.id !== studentObj.id);
      tr.remove();
      // Обновляем таблицу после удаления
      renderStudentsTable(studentsList);
    }
    );

    tdDelete.append(btnDelete);

    tr.append(tdFIO, tdBirthday, tdStudyStart, tdFaculty, tdDelete);
    tr.classList.add('table__row');
    return tr;
  };

  // 4. Сортировка
  let changeSort = true;

  function sortStudentsTable(studentsArray, prop) {
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

  // 5. Фильтрация
  function filterStudentsTable(studentsArray, prop, value) {
    return studentsArray.filter(item =>
      String(item[prop]).toLowerCase().includes(value.toLowerCase())
    );
  }

  function filterStudentsTableByFinalYear(studentsArray, finalYear) {
    return studentsArray.filter(student => {
      const studyFinal = Number(student.studyStart) + 4;
      return studyFinal === Number(finalYear);
    });
  }

  // 6. Валидация
  function checkFirstLetter(input) {
    if (input.value !== '') {
      return input.value = input.value[0].toUpperCase() + input.value.slice(1);
    }
  };

  // 3. Рендер
  async function renderStudentsTable(sortProp = null) {
    const studentsTable = document.getElementById('students-list');
    studentsTable.innerHTML = '';

    // Используем локальный массив, если он уже загружен
    let studentsArray = studentsList.length > 0 ? [...studentsList] : await getStudentsList();

    // Проверка на наличие данных и фильтрация
    studentsArray = studentsArray.filter(student => student && student.surname && student.name && student.lastname);

    // Копируем массив для работы
    let sortedStudentsArray = [...studentsArray];

    // Если передано свойство для сортировки, сортируем копию массива
    if (sortProp) {
      sortStudentsTable(sortedStudentsArray, sortProp);
    }

    // Если массив пустой, выводим сообщение
    if (studentsArray.length === 0) {
      studentsTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет данных для отображения</td></tr>';
      return;
    }

    // Заполняем таблицу
    for (const student of studentsArray) {
      student.fio = student.surname + ' ' + student.name + ' ' + student.lastname;
      student.birthday = new Date(student.birthday);
      student.studyFinal = Number(student.studyStart + 4);
    }

    if (filterFio.value.trim() !== '') {
      filterFio.value = filterFio.value.replace(/[a-zа-я]+/gi, (match) => match[0].toUpperCase() + match.substr(1));
      studentsArray = filterStudentsTable(studentsArray, 'fio', filterFio.value.trim());
    };
    if (filterFaculty.value.trim() !== '') {
      checkFirstLetter(filterFaculty);
      studentsArray = filterStudentsTable(studentsArray, 'faculty', filterFaculty.value.trim());
    };
    if (filterStart.value.trim() !== '') studentsArray = filterStudentsTable(studentsArray, 'studyStart', filterStart.value.trim());
    if (filterFinal.value.trim() !== '') studentsArray = filterStudentsTableByFinalYear(studentsArray, filterFinal.value.trim());

    for (let studentObj of studentsArray) {
      const newTR = getStudentItem(studentObj);
      studentsTable.append(newTR);
    }
  };
  renderStudentsTable();

  // События
  surnameInp.addEventListener('input', () => { checkFirstLetter(surnameInp); });
  nameInp.addEventListener('input', () => { checkFirstLetter(nameInp); });
  lastnameInp.addEventListener('input', () => { checkFirstLetter(lastnameInp); });
  facultyInp.addEventListener('input', () => { checkFirstLetter(facultyInp); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Проверка корректности даты рождения
    const birthday = new Date(ageInp.value.trim());
    if (isNaN(birthday.getTime())) {
      alert('Введите корректную дату рождения.');
      return;
    }

    // Проверка корректности года начала обучения
    const studyStart = parseInt(studyStartInp.value.trim(), 10);
    if (isNaN(studyStart) || studyStart < 2015 || studyStart > new Date().getFullYear()) {
      alert('Введите корректный год начала обучения.');
      return;
    }

    try {
      let newStudentObj = {
        surname: surnameInp.value.trim(),
        name: nameInp.value.trim(),
        lastname: lastnameInp.value.trim(),
        birthday: birthday,
        studyStart: studyStart,
        faculty: facultyInp.value.trim()
      };

      await addStudent(newStudentObj);

      studentsList = await getStudentsList();
      renderStudentsTable(studentsList);
    } catch (error) {
      console.error('Ошибка при добавлении студента:', error);
      alert('Не удалось добавить студента. Проверьте данные и попробуйте снова.');
    }
    renderStudentsTable(studentsList);
  });

  document.getElementById('sort__fio').addEventListener('click', () => {
    sortStudentsTable(studentsList, 'surname');
    changeSort = !changeSort;
    renderStudentsTable('surname');
  });

  document.getElementById('sort__birth').addEventListener('click', () => {
    sortStudentsTable(studentsList, 'birthday');
    changeSort = !changeSort;
    renderStudentsTable('birthday');
  });

  document.getElementById('sort__study').addEventListener('click', () => {
    sortStudentsTable(studentsList, 'studyStart');
    changeSort = !changeSort;
    renderStudentsTable('studyStart');
  });

  document.getElementById('sort__faculty').addEventListener('click', () => {
    sortStudentsTable(studentsList, 'faculty');
    changeSort = !changeSort;
    renderStudentsTable('faculty');
  });

  filterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    renderStudentsTable(studentsList);
  });

  filterFio.addEventListener('input', () => { renderStudentsTable(studentsList); });
  filterFaculty.addEventListener('input', () => { renderStudentsTable(studentsList); });
  filterStart.addEventListener('input', () => { renderStudentsTable(studentsList); });
  filterFinal.addEventListener('input', () => {
    const finalYear = filterFinal.value.trim();
    const filteredStudents = filterStudentsTableByFinalYear(studentsList, finalYear);
    renderStudentsTable(filteredStudents);
  });

})();
