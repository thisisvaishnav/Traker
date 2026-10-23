import React, { useState, useEffect } from 'react';
import { useUser, useClerk, Show, SignIn, SignUp, UserButton } from '@clerk/react';
import { clerkParchmentTheme } from './clerkTheme';

const GUEST_KEY = 'franklin_six_blocks_v3';

const SAYINGS = [
  'Diligence is the mother of good luck.',
  'Early to bed and early to rise, makes a man healthy, wealthy, and wise.',
  'Lost time is never found again.',
  'Well done is better than well said.',
  'He that can have patience can have what he will.',
  'Drive thy business, let not that drive thee.',
  'Employ thy time well, if thou meanest to gain leisure.',
  'One today is worth two tomorrows.',
  'Energy and persistence conquer all things.',
  'An investment in knowledge pays the best interest.',
  'Be at war with your vices, at peace with your neighbours, and let every new year find you a better man.',
  'Little strokes fell great oaks.',
  'Beware of little expenses; a small leak will sink a great ship.',
  'Plough deep, while sluggards sleep, and you shall have corn to sell and to keep.',
  'By failing to prepare, you are preparing to fail.'
];

const INITIAL_CANONICAL_BLOCKS = [
  {
    id: 'b1',
    duration: 3, // strictly: 2, 3, 4
    title: 'Rise, wash, and address Powerful Goodness',
    text: "Contrive day's business, and take the resolution of the day; prosecute the present study, and breakfast.",
    tasks: [],
    done: false
  },
  {
    id: 'b2',
    duration: 4, // strictly: 2, 3, 4
    title: 'Work — Morning Diligence',
    text: 'Deep work, focus on essential ventures without diversion.',
    tasks: [],
    done: false
  },
  {
    id: 'b3',
    duration: 2, // strictly: 2, 3, 4
    title: 'Read, or overlook my accounts, and dine',
    text: 'Examine ledgers, converse with temperance, repast.',
    tasks: [],
    done: false
  },
  {
    id: 'b4',
    duration: 4, // strictly: 2, 3, 4
    title: 'Work — Afternoon Endeavours',
    text: 'Printing, correspondence, trade and industrious labor.',
    tasks: [],
    done: false
  },
  {
    id: 'b5',
    duration: 4, // strictly: 2, 3, 4
    title: 'Put things in their places; supper, diversion & examination',
    text: 'Order the shop and chamber; supper, music or conversation; examination of the day.',
    tasks: [],
    done: false
  }
];

function pad(n) {
  return (n < 10 ? '0' : '') + n;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ord(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getDateInfo() {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mo = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const doy = Math.floor((d - startOfYear) / 864e5);
  const saying = SAYINGS[doy % SAYINGS.length];
  return {
    line: `${days[d.getDay()]}, ${ord(d.getDate())} ${mo[d.getMonth()]} ${d.getFullYear()}`,
    page: doy,
    saying
  };
}

function formatHour(h) {
  const mod = ((h % 24) + 24) % 24;
  const a = mod < 12 ? 'am' : 'pm';
  const n = mod % 12 || 12;
  return { n, a, raw: mod };
}

export default function App() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const [dateInfo] = useState(getDateInfo);
  const [morning, setMorning] = useState('Resolve to act with diligence and justice in all things.');
  const [evening, setEvening] = useState('');
  const [forceEvening, setForceEvening] = useState(false);
  const [scratchpad, setScratchpad] = useState([
    { id: 's1', text: 'Draft letter to Peter Collinson' },
    { id: 's2', text: 'Audit print shop ledger' },
    { id: 's3', text: 'Walk by the river & fresh air' }
  ]);
  const [newScratch, setNewScratch] = useState('');
  const [blocks, setBlocks] = useState(INITIAL_CANONICAL_BLOCKS);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Auth UI state
  const [authModal, setAuthModal] = useState(null); // 'signin' | 'signup' | null
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [inscribedName, setInscribedName] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);

  // Storage key based on user ID for persistent per-user data
  const storageKey = isSignedIn && user ? `franklin_user_${user.id}_${todayKey()}` : `${GUEST_KEY}_${todayKey()}`;

  // Check if user needs to be asked for name after signup
  useEffect(() => {
    if (userLoaded && isSignedIn && user) {
      const hasName = user.firstName || user.unsafeMetadata?.ledgerName;
      if (!hasName) {
        setNameModalOpen(true);
      } else {
        setInscribedName(user.firstName || user.unsafeMetadata?.ledgerName || '');
      }
    }
  }, [userLoaded, isSignedIn, user]);

  // Load saved state for the current user
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.morning !== undefined) setMorning(parsed.morning);
        if (parsed.evening !== undefined) setEvening(parsed.evening);
        if (parsed.forceEvening !== undefined) setForceEvening(parsed.forceEvening);
        if (parsed.scratchpad) setScratchpad(parsed.scratchpad);
        if (parsed.blocks) setBlocks(parsed.blocks);
      } else {
        // Reset to initial canonical state for a fresh day/user
        setBlocks(INITIAL_CANONICAL_BLOCKS);
        setEvening('');
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageKey]);

  // Auto-save on state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          date: todayKey(),
          morning,
          evening,
          forceEvening,
          scratchpad,
          blocks,
          updatedAt: new Date().toISOString()
        })
      );
    } catch (e) {
      console.error(e);
    }
  }, [morning, evening, forceEvening, scratchpad, blocks, storageKey]);

  const currentHour = new Date().getHours();
  const eveningUnlocked = forceEvening || currentHour >= 18 || currentHour < 5;
  const isSealed = evening.trim().length > 0;

  // Compute start hours and hour slots for each block dynamically
  let curHour = 5; // Franklin starts at 5:00 AM
  const computedBlocks = blocks.map((b) => {
    const start = curHour;
    const dur = [2, 3, 4].includes(b.duration) ? b.duration : 3;
    const hoursList = [];
    for (let k = 0; k < dur; k++) {
      hoursList.push((start + k) % 24);
    }
    curHour = (start + dur) % 24;
    return {
      block: b,
      startHour: start,
      endHour: curHour,
      hours: hoursList
    };
  });

  const doneCount = blocks.filter((b) => b.done).length;

  // Name submission after signup
  const handleSaveName = async (e) => {
    e?.preventDefault();
    const clean = inscribedName.trim();
    if (!clean) return;
    setIsSubmittingName(true);
    try {
      if (user) {
        await user.update({
          firstName: clean,
          unsafeMetadata: {
            ...user.unsafeMetadata,
            ledgerName: clean
          }
        });
      }
      setNameModalOpen(false);
    } catch (err) {
      console.error('Error updating name:', err);
      setNameModalOpen(false);
    } finally {
      setIsSubmittingName(false);
    }
  };

  // Actions
  const handleAddScratch = (e) => {
    e?.preventDefault();
    const val = newScratch.trim();
    if (!val) return;
    setScratchpad((prev) => [...prev, { id: 's_' + Date.now(), text: val }]);
    setNewScratch('');
  };

  const handleDelScratch = (id) => {
    setScratchpad((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateBlockField = (idx, field, val) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSetDuration = (idx, dur) => {
    if (![2, 3, 4].includes(dur)) return;
    setBlocks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], duration: dur };
      return copy;
    });
  };

  const handleToggleDone = (idx) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], done: !copy[idx].done };
      return copy;
    });
  };

  const handleDeleteTask = (bIdx, tIdx) => {
    setBlocks((prev) => {
      const copy = [...prev];
      const tasks = [...(copy[bIdx].tasks || [])];
      tasks.splice(tIdx, 1);
      copy[bIdx] = { ...copy[bIdx], tasks };
      return copy;
    });
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset blocks to Franklin's canonical 1726 scheme (3h, 4h, 2h, 4h, 4h)?")) {
      setBlocks(JSON.parse(JSON.stringify(INITIAL_CANONICAL_BLOCKS)));
    }
  };

  const handleClearTasks = () => {
    if (window.confirm('Clear written notes and tasks from all blocks?')) {
      setBlocks((prev) =>
        prev.map((b) => ({
          ...b,
          text: '',
          tasks: [],
          done: false
        }))
      );
      setEvening('');
    }
  };

  // Drag & Drop Handlers
  const handleDragStartScratch = (e, item) => {
    setDraggedItem({ type: 'scratch', id: item.id, data: item });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.text);
  };

  const handleDragStartBlock = (e, idx) => {
    setDraggedItem({ type: 'block', index: idx, id: blocks[idx].id });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blocks[idx].title);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) setDragOverIdx(idx);
  };

  const handleDragLeave = (e, idx) => {
    if (dragOverIdx === idx) setDragOverIdx(null);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (!draggedItem) return;

    if (draggedItem.type === 'scratch') {
      const item = scratchpad.find((s) => s.id === draggedItem.id);
      if (item) {
        setBlocks((prev) => {
          const copy = [...prev];
          const tasks = [...(copy[targetIdx].tasks || []), { text: item.text }];
          copy[targetIdx] = { ...copy[targetIdx], tasks };
          return copy;
        });
        setScratchpad((prev) => prev.filter((s) => s.id !== draggedItem.id));
      }
    } else if (draggedItem.type === 'block') {
      const fromIdx = draggedItem.index;
      if (fromIdx !== targetIdx) {
        setBlocks((prev) => {
          const copy = [...prev];
          const moved = copy.splice(fromIdx, 1)[0];
          copy.splice(targetIdx, 0, moved);
          return copy;
        });
      }
    }
    setDraggedItem(null);
  };

  const displayName = isSignedIn && user ? (user.firstName || user.unsafeMetadata?.ledgerName || 'Friend') : null;

  return (
    <main className="page" role="main">
      {/* Top Ledger & Auth Bar */}
      <div className="ledger-top-bar">
        <div className="ledger-top-left">
          {isSignedIn ? (
            <span className="user-status-text">
              &#x270e; The Annals of <strong>{displayName}</strong>
            </span>
          ) : (
            <span className="user-status-text">&#x270e; Guest Annals (Local)</span>
          )}
        </div>

        <div className="ledger-top-right">
          {isSignedIn ? (
            <>
              <span style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--seal)' }}>
                &bull; Inscribed &amp; Saved
              </span>
              <UserButton appearance={clerkParchmentTheme} />
            </>
          ) : (
            <>
              <button
                type="button"
                className="auth-btn"
                onClick={() => setAuthModal('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className="auth-btn primary"
                onClick={() => setAuthModal('signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="head">
        <div className="head-ornament">&#x25c6; &#x25c6; &#x25c6;</div>
        <h1>{displayName ? `${displayName}'s Daily Page` : 'The Daily Page'}</h1>
        <p className="subtitle">{dateInfo.line} &mdash; page {dateInfo.page} of the year</p>
        <p className="saying">&ldquo;{dateInfo.saying}&rdquo;</p>
      </div>

      <div className="layout">
        {/* Left Column / Sidebar */}
        <div className="sidebar">
          {/* Morning Reflection */}
          <div className="card-box">
            <h2 className="q">The Morning Question</h2>
            <p className="q-sub">What good shall I do this day?</p>
            <textarea
              className="ans"
              rows={2}
              maxLength={160}
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              placeholder="Today I will…"
            />
          </div>

          {/* Quill Scratchpad */}
          <div className="scratchpad card-box">
            <div className="scratchpad-header">
              <h3>Quill Scratchpad</h3>
              <span className="scratchpad-hint">Drag into any block</span>
            </div>
            <form className="scratch-input-row" onSubmit={handleAddScratch}>
              <input
                type="text"
                className="scratch-input"
                placeholder="Jot an intention…"
                maxLength={80}
                value={newScratch}
                onChange={(e) => setNewScratch(e.target.value)}
              />
              <button type="submit" className="quill-add-btn">Jot</button>
            </form>
            <div className="scratch-list">
              {scratchpad.length === 0 ? (
                <div style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--faint)', padding: '8px 4px' }}>
                  No unslotted tasks. Jot above and drag into any block!
                </div>
              ) : (
                scratchpad.map((s) => (
                  <div
                    key={s.id}
                    className="scratch-card"
                    draggable
                    onDragStart={(e) => handleDragStartScratch(e, s)}
                  >
                    <span className="drag-handle">&#x22ee;&#x22ee;</span>
                    <span className="title">{s.text}</span>
                    <button
                      type="button"
                      className="scratch-del"
                      title="Remove"
                      onClick={() => handleDelScratch(s.id)}
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Evening Reflection */}
          <div className="card-box">
            <h2 className="q">The Evening Question</h2>
            <p className="q-sub">What good have I done today?</p>
            <textarea
              className="ans"
              rows={3}
              maxLength={200}
              value={evening}
              disabled={!eveningUnlocked}
              onChange={(e) => setEvening(e.target.value)}
              placeholder={
                eveningUnlocked
                  ? 'Tonight I examined and accomplished…'
                  : 'Opens in the evening block (6:00 PM)'
              }
            />
            {!eveningUnlocked && (
              <button
                type="button"
                className="early-reflect-btn"
                onClick={() => setForceEvening(true)}
              >
                Reflect earlier
              </button>
            )}
            {isSealed && (
              <div className="seal">
                Page complete &bull; 1726
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline Ledger */}
        <div className="timeline-section">
          <div className="timeline-toolbar">
            <div>
              <h2 className="timeline-title">The Six Time Blocks</h2>
              <span className="timeline-subtitle">Franklin's 24-Hour System (3h, 4h, 2h, 4h, 4h &amp; 7h Sleep)</span>
            </div>
            <div className="timeline-actions">
              <button
                type="button"
                className="pill-btn"
                onClick={handleResetToDefault}
              >
                Reset to Franklin 1726
              </button>
            </div>
          </div>

          <div className="timeline-ledger">
            {computedBlocks.map((item, idx) => {
              const b = item.block;
              const isOver = dragOverIdx === idx;
              const isDraggingThis = draggedItem?.type === 'block' && draggedItem?.index === idx;

              return (
                <div
                  key={b.id}
                  className={`franklin-block ${b.done ? 'done' : ''} ${isOver ? 'drag-over' : ''} ${isDraggingThis ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStartBlock(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={(e) => handleDragLeave(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                >
                  {/* Left Hour Column */}
                  <div className="block-hours">
                    {item.hours.map((h) => {
                      const o = formatHour(h);
                      const isNow = h === currentHour;
                      return (
                        <div key={h} className={`hour-cell ${isNow ? 'is-now' : ''}`}>
                          {o.n}<small>{o.a}</small>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Content Area */}
                  <div className="block-content">
                    <div className="block-header">
                      <span className="block-grip" title="Drag to reorder block">&#x22ee;&#x22ee;</span>
                      <input
                        className="block-title-input"
                        value={b.title}
                        onChange={(e) => handleUpdateBlockField(idx, 'title', e.target.value)}
                        aria-label="Block title"
                      />
                      {/* Strictly 2, 3, or 4 hours only */}
                      <div className="dur-selector" title="Duration: strictly 2h, 3h, or 4h">
                        {[2, 3, 4].map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={`dur-opt ${b.duration === d ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDuration(idx, d);
                            }}
                          >
                            {d}h
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="tick-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDone(idx);
                        }}
                        title="Mark completed"
                      >
                        &#x2713;
                      </button>
                    </div>

                    <textarea
                      className="block-textarea"
                      rows={2}
                      value={b.text}
                      onChange={(e) => handleUpdateBlockField(idx, 'text', e.target.value)}
                      placeholder="Write plans, projects or thoughts for these hours…"
                    />

                    {b.tasks && b.tasks.length > 0 && (
                      <div className="block-tasks">
                        {b.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="task-item">
                            <span className="task-bullet">&#x2014;</span>
                            <span>{task.text}</span>
                            <button
                              type="button"
                              className="task-del-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(idx, tIdx);
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="drop-zone-hint">&#x2193; Drop intentions from Quill Scratchpad into this block</div>
                  </div>
                </div>
              );
            })}

            {/* Block 6: Sleep */}
            <div className="sleep-block">
              <div className="sleep-hours">
                <div>10<small>pm</small></div>
                <div style={{ fontSize: '14px', color: 'var(--faint)', margin: '2px 0' }}>&#x2193; 7h</div>
                <div>5<small>am</small></div>
              </div>
              <div className="sleep-content">
                <div className="sleep-title">VI. Sleep</div>
                <div className="sleep-sub">&ldquo;Sleep, wholesome and uninterrupted.&rdquo;</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="foot">
        <span className="progress-stat">{doneCount} of {blocks.length} blocks fulfilled</span>
        <div className="foot-actions">
          <button type="button" className="foot-btn" onClick={() => window.print()}>
            Print Journal
          </button>
          <button type="button" className="foot-btn" onClick={handleClearTasks}>
            Clear Tasks
          </button>
        </div>
      </div>

      {/* Name Inscription Modal After Signup */}
      {nameModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="inscription-card">
            <div className="inscription-ornament">&#x25c6; &#x25c6; &#x25c6;</div>
            <h2 className="inscription-title">Inscribe Thy Name</h2>
            <p className="inscription-sub">
              By what name shalt thou be known in these daily annals?
            </p>
            <form onSubmit={handleSaveName}>
              <input
                type="text"
                className="inscription-input"
                autoFocus
                placeholder="e.g. Benjamin, Abigail…"
                value={inscribedName}
                onChange={(e) => setInscribedName(e.target.value)}
                maxLength={40}
                required
              />
              <div>
                <button
                  type="submit"
                  className="inscription-btn"
                  disabled={isSubmittingName || !inscribedName.trim()}
                >
                  {isSubmittingName ? 'Inscribing…' : 'Inscribe in Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clerk Auth Modal (Sign In / Sign Up) in 1726 Parchment Theme */}
      {authModal && (
        <div className="modal-overlay" onClick={() => setAuthModal(null)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="auth-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setAuthModal(null);
              }}
              title="Close"
            >
              &times;
            </button>
            {authModal === 'signin' ? (
              <SignIn
                appearance={clerkParchmentTheme}
                routing="hash"
                afterSignInUrl="/"
                signUpUrl="#signup"
              />
            ) : (
              <SignUp
                appearance={clerkParchmentTheme}
                routing="hash"
                afterSignUpUrl="/"
                signInUrl="#signin"
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
