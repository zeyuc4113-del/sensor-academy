/* 传感器工坊 - 应用逻辑 */
(function () {
  const LS_KEY = 'sensor_academy_state_v1';

  function pad(n) { return String(n).padStart(2, '0'); }
  function dateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStr() { return dateStr(new Date()); }
  function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); }

  function defaultState() {
    return {
      name: '',
      reminderTime: '07:00',
      completed: {},       // lessonId -> 'YYYY-MM-DD'
      quizLog: {},         // lessonId -> { best, total, tries }
      lastStudyDate: null,
      streak: 0,
      createdAt: todayStr()
    };
  }

  let state = defaultState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) state = Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* ignore */ }

  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function allLessons() {
    const arr = [];
    const course = window.COURSE;
    if (!course || !course.stages) return arr;
    course.stages.forEach(function (st) {
      st.lessons.forEach(function (l) {
        arr.push({ lesson: l, stage: st });
      });
    });
    return arr;
  }
  function nextLesson() {
    const list = allLessons();
    for (let i = 0; i < list.length; i++) {
      if (!state.completed[list[i].lesson.id]) return list[i];
    }
    return null;
  }
  function stats() {
    const list = allLessons();
    const done = list.filter(function (x) { return state.completed[x.lesson.id]; }).length;
    const total = list.length;
    return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  let currentLesson = null;

  function route(view) {
    const views = ['home', 'course', 'lesson', 'quiz', 'library', 'settings'];
    views.forEach(function (v) {
      document.getElementById('view-' + v).classList.toggle('hidden', v !== view);
    });
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-view') === view);
    });
    window.scrollTo(0, 0);
    if (view === 'home') renderHome();
    else if (view === 'course') renderCourse();
    else if (view === 'lesson') renderLesson();
    else if (view === 'quiz') renderQuiz();
    else if (view === 'library') renderLibrary();
    else if (view === 'settings') renderSettings();
  }

  function renderHome() {
    const st = stats();
    document.getElementById('streak-badge').textContent = '🔥 ' + state.streak;
    document.getElementById('progress-badge').textContent = st.pct + '%';
    document.getElementById('greeting').textContent = state.name ? ('你好，' + state.name) : '你好';
    const h = new Date().getHours();
    let greet = '早上好';
    if (h >= 12 && h < 18) greet = '下午好';
    else if (h >= 18 || h < 5) greet = '晚上好';
    document.getElementById('greeting').textContent = greet + (state.name ? '，' + state.name : '');

    const next = nextLesson();
    let todayLine, todayCard;
    if (!next) {
      todayLine = '全部课程已学完，棒。可以复习或等新内容。';
      todayCard = '<div class="card today-done"><div class="big">🎉</div><p>今天的进度全清了。</p></div>';
    } else {
      const l = next.lesson, stg = next.stage;
      todayLine = '今日任务已按顺序排好，点开直接学。';
      todayCard =
        '<div class="card today-task">' +
        '  <span class="tag">今日任务 · 第 ' + (st.done + 1) + ' 天</span>' +
        '  <h2>' + esc(l.title) + '</h2>' +
        '  <p><span class="task-label">' + esc(stg.title) + '</span> · 约 ' + (l.estMin || 20) + ' 分钟</p>' +
        '  <button class="btn primary" onclick="App.openLesson(\'' + l.id + '\')">开始学习 →</button>' +
        '</div>';
    }
    document.getElementById('today-line').textContent = todayLine;
    document.getElementById('today-card').innerHTML = todayCard;

    document.getElementById('overall-bar').style.width = st.pct + '%';
    document.getElementById('stat-done').textContent = st.done;
    document.getElementById('stat-total').textContent = st.total;
    document.getElementById('stat-streak').textContent = state.streak;
  }

  function renderCourse() {
    const html = window.COURSE.stages.map(function (st, i) {
      const doneCount = st.lessons.filter(function (l) { return state.completed[l.id]; }).length;
      const lessonItems = st.lessons.map(function (l, j) {
        const done = !!state.completed[l.id];
        return '<div class="lesson-item' + (done ? ' done' : '') + '" onclick="App.openLesson(\'' + l.id + '\')">' +
          '<span class="ck">' + (done ? '✓' : '') + '</span>' +
          '<span class="l-title">' + esc(l.title) + '</span>' +
          '<span class="l-day">第' + (j + 1) + '课</span>' +
          '</div>';
      }).join('');
      return '<div class="stage' + (i === 0 ? ' open' : '') + '" data-idx="' + i + '">' +
        '<div class="stage-head" onclick="App.toggleStage(' + i + ')">' +
        '  <span class="stage-num">' + (i + 1) + '</span>' +
        '  <span class="stage-title">' + esc(st.title) + '</span>' +
        '  <span class="stage-weeks">' + esc(st.weeks || '') + '</span>' +
        '  <span class="stage-count">' + doneCount + '/' + st.lessons.length + '</span>' +
        '</div>' +
        '<div class="stage-desc">' + esc(st.desc || '') + '</div>' +
        '<div class="stage-lessons">' + lessonItems + '</div>' +
        '</div>';
    }).join('');
    document.getElementById('stage-list').innerHTML = html;
  }

  function findLesson(id) {
    const list = allLessons();
    for (let i = 0; i < list.length; i++) if (list[i].lesson.id === id) return list[i];
    return null;
  }

  function renderLesson() {
    if (!currentLesson) { route('course'); return; }
    const l = currentLesson.lesson, stg = currentLesson.stage;
    document.getElementById('lesson-stage-tag').textContent = stg.title;
    document.getElementById('lesson-title').textContent = l.title;
    document.getElementById('lesson-est').textContent = '约 ' + (l.estMin || 20) + ' 分钟';
    document.getElementById('lesson-content').innerHTML = l.content || '';
    document.getElementById('btn-quiz').style.display = (l.quiz && l.quiz.length) ? '' : 'none';
    const done = !!state.completed[l.id];
    document.getElementById('btn-done').textContent = done ? '✓ 已学完' : '直接标记完成';
    document.getElementById('btn-done').disabled = done;
  }

  function renderQuiz() {
    if (!currentLesson) { route('course'); return; }
    const l = currentLesson.lesson;
    document.getElementById('quiz-title').textContent = '小测 · ' + l.title;
    if (!l.quiz || !l.quiz.length) {
      document.getElementById('quiz-body').innerHTML = '<div class="card">本课暂无测验。</div>';
      return;
    }
    const html = l.quiz.map(function (q, qi) {
      const opts = q.options.map(function (opt, oi) {
        return '<label class="opt"><input type="radio" name="q' + qi + '" value="' + oi + '">' + esc(opt) + '</label>';
      }).join('');
      return '<div class="quiz-q" data-q="' + qi + '" data-ans="' + q.answer + '">' +
        '<div class="q-title">' + (qi + 1) + '. ' + esc(q.q) + '</div>' +
        opts +
        '<div class="explain">' + esc(q.explain || '') + '</div>' +
        '</div>';
    }).join('');
    document.getElementById('quiz-body').innerHTML =
      html +
      '<div class="card"><div class="quiz-result" id="quiz-score"></div>' +
      '<button class="btn primary" style="width:100%" onclick="App.submitQuiz()">交卷</button>' +
      '<div id="quiz-after" style="margin-top:12px"></div></div>';
  }

  function openLesson(id) {
    const found = findLesson(id);
    if (!found) return;
    currentLesson = found;
    route('lesson');
  }
  function openQuiz() {
    if (currentLesson) route('quiz');
  }
  function markDone() {
    if (!currentLesson) return;
    markComplete(currentLesson.lesson.id);
    route('home');
  }

  function markComplete(id) {
    const t = todayStr();
    if (state.completed[id] === t) return;
    state.completed[id] = t;
    if (state.lastStudyDate === t) {
      /* already studied today */
    } else if (state.lastStudyDate === yesterdayStr()) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.lastStudyDate = t;
    saveState();
  }

  function submitQuiz() {
    if (!currentLesson) return;
    const l = currentLesson.lesson;
    const qs = document.querySelectorAll('.quiz-q');
    let correct = 0;
    qs.forEach(function (box) {
      const ans = parseInt(box.getAttribute('data-ans'), 10);
      const checked = box.querySelector('input:checked');
      const picked = checked ? parseInt(checked.value, 10) : -1;
      const opts = box.querySelectorAll('label.opt');
      box.classList.add('show');
      if (picked === ans) { correct++; opts[ans].classList.add('correct'); }
      else {
        opts[ans].classList.add('correct');
        if (picked >= 0) opts[picked].classList.add('wrong');
      }
      opts.forEach(function (o) { o.querySelector('input').disabled = true; });
    });
    const total = qs.length;
    const pct = Math.round(correct / total * 100);
    document.getElementById('quiz-score').textContent = '得分：' + correct + ' / ' + total + '（' + pct + '%）';
    const prev = state.quizLog[l.id] || { best: -1, total: total, tries: 0 };
    state.quizLog[l.id] = {
      best: Math.max(prev.best, correct),
      total: total,
      tries: prev.tries + 1
    };
    markComplete(l.id);
    saveState();
    document.getElementById('quiz-after').innerHTML =
      '<button class="btn ghost" onclick="App.route(\'home\')">回首页</button> ' +
      '<button class="btn" onclick="App.route(\'course\')">看课程地图</button>';
    window.scrollTo(0, document.body.scrollHeight);
  }

  function toggleStage(i) {
    const el = document.querySelectorAll('.stage')[i];
    if (el) el.classList.toggle('open');
  }

  /* 资料库 */
  let currentLibTab = 'terms';
  function renderLibrary() {
    const lib = window.LIBRARY || {};
    const tabs = ['terms'];
    let tabsHtml = '<div class="lib-tab-row">' +
      '<button class="lib-tab' + (currentLibTab === 'terms' ? ' active' : '') + '" onclick="App.libTab(\'terms\')">术语表</button>';
    if (lib.specs && lib.specs.length) {
      tabs.push('specs');
      tabsHtml += '<button class="lib-tab' + (currentLibTab === 'specs' ? ' active' : '') + '" onclick="App.libTab(\'specs\')">选型参数</button>';
    }
    if (lib.circuits && lib.circuits.length) {
      tabs.push('circuits');
      tabsHtml += '<button class="lib-tab' + (currentLibTab === 'circuits' ? ' active' : '') + '" onclick="App.libTab(\'circuits\')">电路图库</button>';
    }
    tabsHtml += '</div>';
    let body = '';
    if (currentLibTab === 'terms') {
      body = (lib.terms || []).map(function (t) {
        return '<div class="term-item"><div class="t">' + esc(t.t) + (t.en ? '<small>' + esc(t.en) + '</small>' : '') + '</div><div class="d">' + esc(t.d) + '</div></div>';
      }).join('');
    } else if (currentLibTab === 'specs') {
      body = (lib.specs || []).map(function (s) { return '<div class="term-item"><div class="t">' + esc(s.t) + '</div><div class="d">' + esc(s.d) + '</div></div>'; }).join('');
    } else if (currentLibTab === 'circuits') {
      body = (lib.circuits || []).map(function (c) {
        const pre = c.pre ? '<pre class="ascii">' + esc(c.pre) + '</pre>' : '';
        return '<div class="term-item"><div class="t">' + esc(c.t) + '</div>' + pre + '<div class="d">' + esc(c.d) + '</div></div>';
      }).join('');
    }
    if (!body) body = '<div class="card">资料还在整理，会随课程逐步补上。</div>';
    document.getElementById('library-body').innerHTML = tabsHtml + body;
  }
  function libTab(t) { currentLibTab = t; renderLibrary(); }

  /* 设置 */
  function renderSettings() {
    document.getElementById('set-name').value = state.name || '';
    document.getElementById('set-reminder').value = state.reminderTime || '07:00';
    document.getElementById('version-line').textContent = '版本 ' + (window.COURSE ? window.COURSE.meta.version : '0.1.0') + ' · 数据存本机';
  }
  function saveName(v) { state.name = v; saveState(); renderHome(); }
  function saveReminder(v) { state.reminderTime = v || '07:00'; saveState(); }

  function exportData() {
    const data = JSON.stringify({ app: 'sensor-academy', exportedAt: new Date().toISOString(), state: state }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sensor-academy-backup-' + todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  function importData(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const obj = JSON.parse(e.target.result);
        const s = obj.state || obj;
        if (!s || typeof s.completed !== 'object') { alert('备份文件格式不对'); return; }
        state = Object.assign(defaultState(), s);
        saveState();
        renderHome();
        route('home');
        alert('导入成功');
      } catch (err) { alert('导入失败：' + err.message); }
    };
    reader.readAsText(file);
    input.value = '';
  }
  function resetAll() {
    if (!confirm('确定清空所有学习进度？此操作不可撤销。')) return;
    state = defaultState();
    saveState();
    renderHome();
    route('home');
  }

  window.App = {
    route: route,
    openLesson: openLesson,
    openQuiz: openQuiz,
    markDone: markDone,
    submitQuiz: submitQuiz,
    toggleStage: toggleStage,
    libTab: libTab,
    saveName: saveName,
    saveReminder: saveReminder,
    exportData: exportData,
    importData: importData,
    resetAll: resetAll
  };

  document.addEventListener('DOMContentLoaded', function () {
    renderHome();
  });
})();
