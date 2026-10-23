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

function getDateInfo() {
  const d = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const line = d.toLocaleDateString('en-US', options);

  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const saying = SAYINGS[dayOfYear % SAYINGS.length];
  return { line, page: dayOfYear, saying };
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

  // View state: 'scheme' (The Scheme of the Hours page) | 'tracker' (The Daily Page writing page)
  const [currentView, setCurrentView] = useState('scheme');

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

  // Wake-up and Sleep Hour State
  const [riseHour, setRiseHour] = useState(5); // default 5:00 AM
  const [restHour, setRestHour] = useState(22); // default 10:00 PM
  const [tempRise, setTempRise] = useState(5);
  const [tempRest, setTempRest] = useState(22);

  // Auth UI state
  const [authModal, setAuthModal] = useState(null); // 'signin' | 'signup' | null
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [inscribedName, setInscribedName] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);

  // Top-left inline name edit state
  const [isEditingTopName, setIsEditingTopName] = useState(false);
  const [topNameInput, setTopNameInput] = useState('');

  // Storage key based on user ID for persistent per-user data
  const storageKey = isSignedIn && user ? `franklin_user_${user.id}_${todayKey()}` : `${GUEST_KEY}_${todayKey()}`;

  // Check if user needs to be asked for name after signup
  useEffect(() => {
    if (userLoaded && isSignedIn && user) {
      const existing = user.firstName || user.unsafeMetadata?.ledgerName;
      if (!existing) {
        setNameModalOpen(true);
      } else {
        setInscribedName(existing);
        setTopNameInput(existing);
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
        if (parsed.riseHour !== undefined) {
          setRiseHour(parsed.riseHour);
          setTempRise(parsed.riseHour);
        }
        if (parsed.restHour !== undefined) {
          setRestHour(parsed.restHour);
          setTempRest(parsed.restHour);
        }
      } else {
        // Fresh canonical state
        setBlocks(INITIAL_CANONICAL_BLOCKS);
        setEvening('');
        setRiseHour(5);
        setRestHour(22);
        setTempRise(5);
        setTempRest(22);
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
          riseHour,
          restHour,
          updatedAt: new Date().toISOString()
        })
      );
    } catch (e) {
      console.error(e);
    }
  }, [morning, evening, forceEvening, scratchpad, blocks, riseHour, restHour, storageKey]);

  const currentHour = new Date().getHours();
  const eveningUnlocked = forceEvening || currentHour >= (restHour - 4) || currentHour < riseHour;
  const isSealed = evening.trim().length > 0;

  // Sleep duration
  const sleepDuration = ((riseHour - restHour) % 24 + 24) % 24 || 7;

  // Compute start hours and hour slots for each waking block dynamically starting from riseHour
  let curHour = riseHour;
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

  // Navigation handlers
  const openSchemePage = () => {
    setTempRise(riseHour);
    setTempRest(restHour);
    setCurrentView('scheme');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyHoursAndProceed = (e) => {
    e?.preventDefault();
    setRiseHour(tempRise);
    setRestHour(tempRest);
    setCurrentView('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetHoursCanonical = () => {
    setTempRise(5);
    setTempRest(22);
  };

  // Name submission handler (updates Clerk user profile + unsafeMetadata)
  const saveNameToClerk = async (nameStr) => {
    const clean = nameStr.trim();
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
      setInscribedName(clean);
      setTopNameInput(clean);
      setNameModalOpen(false);
      setIsEditingTopName(false);
    } catch (err) {
      console.error('Error updating name:', err);
      setNameModalOpen(false);
      setIsEditingTopName(false);
    } finally {
      setIsSubmittingName(false);
    }
  };

  const handleSaveNameModal = async (e) => {
    e?.preventDefault();
    await saveNameToClerk(inscribedName);
  };

  const handleSaveTopName = async (e) => {
    e?.preventDefault();
    await saveNameToClerk(topNameInput);
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

  const handleSlotScratchIntoBlock = (scratchId, targetIdx) => {
    const item = scratchpad.find((s) => s.id === scratchId);
    if (!item) return;
    setBlocks((prev) => {
      const copy = [...prev];
      const tasks = [...(copy[targetIdx].tasks || []), { text: item.text }];
      copy[targetIdx] = { ...copy[targetIdx], tasks };
      return copy;
    });
    setScratchpad((prev) => prev.filter((s) => s.id !== scratchId));
  };

  const handleToggleDone = (blockIdx) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[blockIdx] = { ...copy[blockIdx], done: !copy[blockIdx].done };
      return copy;
    });
  };

  const handleSetDuration = (blockIdx, dur) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[blockIdx] = { ...copy[blockIdx], duration: dur };
      return copy;
    });
  };

  const handleUpdateBlockField = (blockIdx, field, val) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[blockIdx] = { ...copy[blockIdx], [field]: val };
      return copy;
    });
  };

  const handleDeleteTask = (blockIdx, taskIdx) => {
    setBlocks((prev) => {
      const copy = [...prev];
      const tasks = copy[blockIdx].tasks.filter((_, i) => i !== taskIdx);
      copy[blockIdx] = { ...copy[blockIdx], tasks };
      return copy;
    });
  };

  const handleClearTasks = () => {
    if (window.confirm('Wipe all intentions and reset block notes for the day?')) {
      setBlocks((prev) =>
        prev.map((b) => ({
          ...b,
          tasks: [],
          text: '',
          done: false
        }))
      );
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Restore Benjamin Franklin's canonical 1726 schedule?")) {
      setBlocks(INITIAL_CANONICAL_BLOCKS);
      setRiseHour(5);
      setRestHour(22);
      setTempRise(5);
      setTempRest(22);
    }
  };

  // Drag and drop handlers
  const handleDragStartScratch = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'scratch', item }));
    setDraggedItem({ type: 'scratch', id: item.id, text: item.text });
  };

  const handleDragStartBlock = (e, index) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'block', index }));
    setDraggedItem({ type: 'block', index });
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
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
      const raw = e.dataTransfer.getData('application/json');
      let item = null;
      try {
        item = JSON.parse(raw).item;
      } catch (err) {
        item = scratchpad.find((s) => s.id === draggedItem.id);
      }
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
            isEditingTopName ? (
              <form className="inline-name-form" onSubmit={handleSaveTopName}>
                <span className="user-status-text">&#x270e; The Annals of</span>
                <input
                  type="text"
                  className="inline-name-input"
                  autoFocus
                  maxLength={40}
                  value={topNameInput}
                  onChange={(e) => setTopNameInput(e.target.value)}
                  placeholder="Enter name…"
                />
                <button
                  type="submit"
                  className="inline-name-save"
                  disabled={isSubmittingName || !topNameInput.trim()}
                >
                  {isSubmittingName ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="inline-name-cancel"
                  onClick={() => {
                    setIsEditingTopName(false);
                    setTopNameInput(displayName || '');
                  }}
                  title="Cancel"
                >
                  &times;
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="name-editor-btn"
                onClick={() => {
                  setTopNameInput(displayName || '');
                  setIsEditingTopName(true);
                }}
                title="Click to change thy name in the ledger"
              >
                &#x270e; The Annals of <strong>{displayName}</strong>
                <span className="name-edit-icon" aria-hidden="true">&#x270d;&#xfe0e;</span>
              </button>
            )
          ) : (
            <span className="user-status-text">&#x270e; Guest Annals (Local)</span>
          )}
        </div>

        <div className="ledger-top-right">
          {currentView === 'tracker' && (
            <button
              type="button"
              className="auth-btn"
              onClick={openSchemePage}
              title="Return to the Scheme of the Hours page"
            >
              ◷ Scheme of Hours
            </button>
          )}
          {isSignedIn ? (
            <>
              <span className="inscribed-saved-badge">
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

      {/* VIEW 1: THE SCHEME OF THE HOURS PAGE */}
      {currentView === 'scheme' ? (
        <section className="scheme-page-view" aria-label="The Scheme of the Hours">
          <div className="scheme-parchment-frame">
            <div className="head-ornament">&#x25c6; &#x25c6; &#x25c6;</div>
            <h1 className="scheme-main-title">The Scheme of the Hours</h1>
            <p className="scheme-epigraph">
              &ldquo;Let each part of your business have its time. Resolve to perform what you ought; perform without fail what you resolve.&rdquo;
            </p>
            <p className="scheme-sub-text">
              Before taking quill to parchment, establish the boundaries of thy day &mdash; the hour the spirit awaketh, and the hour it seeketh wholesome repose.
            </p>

            <div className="scheme-divider">
              <span className="scheme-divider-mark">&#x2740;</span>
            </div>

            {/* Rising Hour Strip */}
            <div className="scheme-section">
              <h2 className="scheme-question">I. At what hour dost thou rise?</h2>
              <p className="scheme-hint">Select the hour of rising, morning meditation, and address to Powerful Goodness</p>
              <div className="strip-wrap">
                <div className="strip" role="group" aria-label="Hour of rising">
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
                    const o = formatHour(h);
                    const isSel = tempRise === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        aria-pressed={isSel}
                        onClick={() => setTempRise(h)}
                      >
                        {o.n}<small>{o.a}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resting Hour Strip */}
            <div className="scheme-section">
              <h2 className="scheme-question">II. At what hour dost thou rest?</h2>
              <p className="scheme-hint">Select the hour of examination, music, and wholesome uninterrupted sleep</p>
              <div className="strip-wrap">
                <div className="strip" role="group" aria-label="Hour of rest">
                  {[20, 21, 22, 23, 24, 25].map((h) => {
                    const o = formatHour(h);
                    const isSel = tempRest === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        aria-pressed={isSel}
                        onClick={() => setTempRest(h)}
                      >
                        {o.n}<small>{o.a}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Day Division Summary */}
            {(() => {
              const previewSleep = ((tempRise - tempRest) % 24 + 24) % 24 || 7;
              const previewWaking = 24 - previewSleep;
              return (
                <div className="scheme-balance-box">
                  <div className="scheme-balance-hours">
                    <strong>{formatHour(tempRise).n}{formatHour(tempRise).a}</strong> Waking &bull;{' '}
                    <strong>{formatHour(tempRest).n}{formatHour(tempRest).a}</strong> Resting
                  </div>
                  <div className="scheme-balance-sub">
                    {previewWaking} hours of waking endeavor &bull; {previewSleep} hours of wholesome repose
                  </div>
                </div>
              );
            })()}

            {/* Actions to move to Tracker Writing Page */}
            <div className="scheme-cta-row">
              <button
                type="button"
                className="scheme-proceed-btn"
                onClick={handleApplyHoursAndProceed}
              >
                Inscribe Scheme &amp; Open Daily Journal &#x2192;
              </button>
              <button
                type="button"
                className="scheme-reset-link"
                onClick={handleResetHoursCanonical}
              >
                Reset to Franklin's 1726 Scheme (5:00 AM &ndash; 10:00 PM)
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* VIEW 2: THE TRACKER WRITING PAGE */
        <>
          {/* Header */}
          <div className="head">
            <div className="head-ornament">&#x25c6; &#x25c6; &#x25c6;</div>
            <h1>{displayName ? `${displayName}'s Daily Page` : 'The Daily Page'}</h1>
            <p className="subtitle">{dateInfo.line} &mdash; page {dateInfo.page} of the year</p>
            <p className="saying">&ldquo;{dateInfo.saying}&rdquo;</p>
          </div>

          <div className="layout">
            {/* Morning Reflection */}
            <div className="card-box card-morning">
              <h2 className="q">The Morning Question</h2>
              <p className="q-sub">What good shall I do this day?</p>
              <textarea
                className="ans"
                rows={3}
                maxLength={200}
                value={morning}
                onChange={(e) => setMorning(e.target.value)}
                placeholder="Write your morning resolution with the quill…"
              />
            </div>

            {/* Quill Scratchpad / Unslotted Intentions */}
            <div className="card-box scratchpad card-scratch">
              <div className="scratchpad-header">
                <h3>Quill Scratchpad</h3>
                <span className="scratchpad-hint">Daily Intentions</span>
              </div>
              <form onSubmit={handleAddScratch} className="scratch-input-row">
                <input
                  type="text"
                  className="scratch-input"
                  placeholder="Inscribe a duty or intention…"
                  value={newScratch}
                  onChange={(e) => setNewScratch(e.target.value)}
                  maxLength={70}
                />
                <button type="submit" className="quill-add-btn" title="Add intention">
                  + Add
                </button>
              </form>
              <div className="scratch-list">
                {scratchpad.length === 0 ? (
                  <div style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--faint)', padding: '8px 4px' }}>
                    No unslotted tasks. Jot above and slot into any block!
                  </div>
                ) : (
                  scratchpad.map((s) => (
                    <div
                      key={s.id}
                      className="scratch-card"
                      draggable
                      onDragStart={(e) => handleDragStartScratch(e, s)}
                    >
                      <span className="drag-handle" title="Drag to block">&#x22ee;&#x22ee;</span>
                      <span className="title">{s.text}</span>
                      <div className="scratch-actions">
                        <select
                          className="scratch-slot-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value !== '') {
                              handleSlotScratchIntoBlock(s.id, parseInt(e.target.value, 10));
                            }
                          }}
                          title="Slot intention into a block"
                        >
                          <option value="" disabled>Slot &#x25be;</option>
                          {blocks.map((b, bIdx) => (
                            <option key={b.id} value={bIdx}>
                              Block {bIdx + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="scratch-del"
                          title="Remove"
                          onClick={() => handleDelScratch(s.id)}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline Ledger */}
            <div className="timeline-section">
              <div className="timeline-toolbar">
                <div className="timeline-title-wrap">
                  <h2 className="timeline-title">The Six Time Blocks</h2>
                  <span className="timeline-subtitle">
                    Franklin's 24-Hour System ({formatHour(riseHour).n}{formatHour(riseHour).a} &ndash; {formatHour(restHour).n}{formatHour(restHour).a})
                  </span>
                </div>
                <div className="timeline-actions">
                  <button
                    type="button"
                    className="pill-btn hours-btn"
                    onClick={openSchemePage}
                    title="Return to the Scheme of the Hours page"
                  >
                    &#x25f7; Hours: {formatHour(riseHour).n}{formatHour(riseHour).a} &ndash; {formatHour(restHour).n}{formatHour(restHour).a}
                  </button>
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

                        <div className="drop-zone-hint">&#x2193; Drop intentions or use Slot &#x25be; above</div>
                      </div>
                    </div>
                  );
                })}

                {/* Block 6: Sleep */}
                <div
                  className="sleep-block"
                  onClick={openSchemePage}
                  title="Click to view or adjust the Scheme of the Hours"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openSchemePage();
                  }}
                >
                  <div className="sleep-hours">
                    <div>{formatHour(restHour).n}<small>{formatHour(restHour).a}</small></div>
                    <div style={{ fontSize: '14px', color: 'var(--seal)', margin: '2px 0' }}>&#x2193; {sleepDuration}h</div>
                    <div>{formatHour(riseHour).n}<small>{formatHour(riseHour).a}</small></div>
                  </div>
                  <div className="sleep-content">
                    <div className="sleep-title">
                      <span>VI. Sleep</span>
                      <span className="adjust-hours-pill">&#x25f7; Scheme of Hours</span>
                    </div>
                    <div className="sleep-sub">&ldquo;Sleep, wholesome and uninterrupted.&rdquo; &bull; {sleepDuration}h repose</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evening Reflection */}
            <div className="card-box card-evening">
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
                    : `Opens in the evening block (${formatHour(restHour - 4).n}:00 ${formatHour(restHour - 4).a})`
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

          {/* Footer */}
          <div className="foot">
            <span className="progress-stat">{doneCount} of {blocks.length} blocks fulfilled</span>
            <div className="foot-actions">
              <button type="button" className="foot-btn" onClick={openSchemePage}>
                ◷ The Scheme of the Hours
              </button>
              <button type="button" className="foot-btn" onClick={() => window.print()}>
                Print Journal
              </button>
              <button type="button" className="foot-btn" onClick={handleClearTasks}>
                Clear Tasks
              </button>
            </div>
          </div>
        </>
      )}

      {/* Name Inscription Modal After Signup */}
      {nameModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="inscription-card">
            <div className="inscription-ornament">&#x25c6; &#x25c6; &#x25c6;</div>
            <h2 className="inscription-title">Inscribe Thy Name</h2>
            <p className="inscription-sub">
              By what name shalt thou be known in these daily annals?
            </p>
            <form onSubmit={handleSaveNameModal}>
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
