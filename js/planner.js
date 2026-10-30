// COS 106 - Web Technologies: Academic Planner Task Manager
// Student: Adebayo Elisha (Cybersecurity, 100 Level - Second Semester)
// Symmetrical Studio Layout & Miva Second Semester Course Integration

document.addEventListener('DOMContentLoaded', () => {
  initPlanner();
});

function initPlanner() {
  const form = document.getElementById('plannerForm');
  const taskList = document.getElementById('taskList');
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  const countTotal = document.getElementById('countTotal');
  const countPending = document.getElementById('countPending');
  const countCompleted = document.getElementById('countCompleted');

  // Course Selector & Quick Badges
  const courseSelect = document.getElementById('taskCourse');
  const quickCoursePills = document.querySelectorAll('.quick-course-pill');

  // Priority Segment Buttons & Status Indicator
  const priorityInput = document.getElementById('taskPriority');
  const priorityBtns = document.querySelectorAll('.priority-segment-btn');
  const priorityStatusNote = document.getElementById('priorityStatusNote');

  // Date Field & Quick Chips
  const dateInput = document.getElementById('taskDueDate');
  const dateChips = document.querySelectorAll('.date-chip-btn');

  // Reset defaults button
  const btnReset = document.getElementById('btnResetTasks');

  const STORAGE_KEY = 'miva_academic_planner_tasks_v2';

  // Helper to format Date string (YYYY-MM-DD)
  function getOffsetDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(days, 10));
    // local date parts (toISOString is UTC and is a day behind in Nigeria 00:00-01:00)
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // Initialize Default Date to "In 1 Week" (offset 7)
  if (dateInput) {
    dateInput.value = getOffsetDate(7);
  }

  // Synchronize Quick Course Pills with Dropdown
  if (courseSelect && quickCoursePills.length) {
    quickCoursePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const selectedCode = pill.getAttribute('data-course');
        if (selectedCode) {
          courseSelect.value = selectedCode;
          updateActiveCoursePill(selectedCode);
        }
      });
    });

    courseSelect.addEventListener('change', () => {
      updateActiveCoursePill(courseSelect.value);
    });

    function updateActiveCoursePill(code) {
      quickCoursePills.forEach(p => {
        if (p.getAttribute('data-course') === code) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    }
  }

  // Quick Date Preset Chips
  dateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dateChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const offset = chip.getAttribute('data-offset');
      if (dateInput && offset !== null) {
        dateInput.value = getOffsetDate(offset);
      }
    });
  });

  // Segmented Priority Control & Status Note
  const priorityMeta = {
    low: { text: 'Low urgency / supplementary review', className: 'note-low' },
    medium: { text: 'Standard coursework deliverable', className: 'note-medium' },
    high: { text: 'High urgency / lab milestone deadline', className: 'note-high' }
  };

  priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      priorityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selected = btn.getAttribute('data-priority') || 'medium';
      if (priorityInput) {
        priorityInput.value = selected;
      }
      if (priorityStatusNote && priorityMeta[selected]) {
        priorityStatusNote.className = `priority-status-note ${priorityMeta[selected].className}`;
        const textSpan = priorityStatusNote.querySelector('.status-text');
        if (textSpan) textSpan.textContent = priorityMeta[selected].text;
      }
    });
  });

  // Authentic 100 Level Second Semester Initial Tasks from MIVA LMS Portal
  function getSecondSemesterDefaults() {
    return [
      {
        id: 'task-1',
        title: 'Design & Develop COS 106 Student Portfolio Web Platform (Term Project)',
        course: 'COS 106',
        dueDate: getOffsetDate(3),
        priority: 'high',
        completed: false
      },
      {
        id: 'task-2',
        title: 'Implement COS 102 Lab Assignment 1 (Right Triangle Classifier & Palindrome Verifier)',
        course: 'COS 102',
        dueDate: getOffsetDate(-2),
        priority: 'high',
        completed: true
      },
      {
        id: 'task-3',
        title: 'Complete MTH 102 Calculus Practice Sets on Limits & Differential Equations',
        course: 'MTH 102',
        dueDate: getOffsetDate(6),
        priority: 'medium',
        completed: false
      },
      {
        id: 'task-4',
        title: 'Submit PHY 108 General Physics Practical II Laboratory Error Analysis',
        course: 'PHY 108',
        dueDate: getOffsetDate(10),
        priority: 'medium',
        completed: false
      },
      {
        id: 'task-5',
        title: 'Review GST 112 Nigerian Peoples and Culture Historical Sociopolitics Module',
        course: 'GST 112',
        dueDate: getOffsetDate(-4),
        priority: 'low',
        completed: true
      },
      {
        id: 'task-6',
        title: 'Complete COS 111 Technical Certification in Computing I Checkpoint Milestones',
        course: 'COS 111',
        dueDate: getOffsetDate(12),
        priority: 'low',
        completed: false
      }
    ];
  }

  let tasks = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : getSecondSemesterDefaults();
  } catch (e) {
    tasks = getSecondSemesterDefaults();
  }

  let currentFilter = 'all';

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    if (countTotal) countTotal.textContent = total;
    if (countPending) countPending.textContent = pending;
    if (countCompleted) countCompleted.textContent = completed;
  }

  function renderTasks(focusTaskId = null) {
    if (!taskList) return;
    taskList.innerHTML = '';

    const filtered = tasks.filter(t => {
      if (currentFilter === 'pending') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      taskList.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted); font-size: 0.9rem;">
          <p>No study tasks found for this view.</p>
          <button type="button" class="btn btn-secondary" style="margin-top: 12px; font-size: 0.8rem; padding: 6px 14px;" onclick="document.getElementById('taskTitle').focus();">
            Create a New Deliverable
          </button>
        </div>
      `;
      updateStats();
      return;
    }

    filtered.forEach(task => {
      const pr = ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium';
      const item = document.createElement('article');
      item.className = `task-entry ${task.completed ? 'done' : ''}`;
      item.id = task.id;

      item.innerHTML = `
        <div class="task-entry-left">
          <button type="button" class="custom-checkbox-btn" aria-label="Task completed" aria-pressed="${task.completed}" title="${task.completed ? 'Mark pending' : 'Mark completed'}">
            ${task.completed ? '&#10003;' : ''}
          </button>
          <div class="task-entry-body">
            <span class="task-label-text">${escapeHtml(task.title)}</span>
            <div class="task-meta-row">
              <span><b>Module:</b> <span class="course-code-pill" style="font-size: 0.7rem; padding: 1px 6px;">${escapeHtml(task.course || 'COS 106')}</span></span>
              <span><b>Due:</b> ${escapeHtml(task.dueDate || 'No Target Date')}</span>
              <span class="semester-pill-small" style="font-size: 0.68rem;">Second Semester</span>
            </div>
          </div>
        </div>
        <div class="task-entry-right">
          <span class="priority-tag tag-${pr}">${pr}</span>
          <button type="button" class="btn-trash" title="Delete task" aria-label="Delete task">&times;</button>
        </div>
      `;

      // Toggle complete on click
      const checkBtn = item.querySelector('.custom-checkbox-btn');
      checkBtn.addEventListener('click', () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(task.id);
      });

      // Delete task on click
      const deleteBtn = item.querySelector('.btn-trash');
      deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        renderTasks();
      });

      taskList.appendChild(item);
    });

    updateStats();

    if (focusTaskId) {
      const targetBtn = document.querySelector(`#${focusTaskId} .custom-checkbox-btn`);
      if (targetBtn) targetBtn.focus();
    }
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('taskTitle');
      const courseSelect = document.getElementById('taskCourse');

      const title = titleInput.value.trim();
      if (!title) {
        titleInput.focus();
        return;
      }

      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        course: courseSelect ? courseSelect.value : 'COS 106',
        dueDate: dateInput.value || getOffsetDate(7),
        priority: priorityInput ? priorityInput.value : 'medium',
        completed: false
      };

      tasks.unshift(newTask);
      saveTasks();
      renderTasks();

      // Reset fields
      titleInput.value = '';
      titleInput.focus();
    });
  }

  // Wire up Reset Defaults
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset your planner to default 100L Second Semester coursework tasks?')) {
        tasks = getSecondSemesterDefaults();
        saveTasks();
        renderTasks();
      }
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderTasks();
    });
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderTasks();
}
