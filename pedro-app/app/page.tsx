"use client";

import { useMemo, useState } from "react";
import GameTable from "../components/GameTable";

type View = "login" | "lobby" | "create" | "game" | "tournaments" | "profile";
type RuleMode = "follow" | "cut";

const openTables = [
  { name: "Bayou Table 1", host: "PoppaT", rules: "Follow Suit", score: 52, players: "3/4" },
  { name: "Cajun Crew", host: "Lafitte", rules: "Cut-Throat", score: 64, players: "2/4" },
  { name: "Golden Meadow", host: "TroutMan", rules: "Follow Suit", score: 52, players: "4/4" },
  { name: "Thibodaux Kings", host: "RedFish", rules: "Cut-Throat", score: 52, players: "1/4" },
];

export default function Home() {
  const [view, setView] = useState<View>("login");
  const [ruleMode, setRuleMode] = useState<RuleMode>("follow");
  const [isPrivate, setIsPrivate] = useState(true);
  const [tableName, setTableName] = useState("Bayou Good Times");
  const [score, setScore] = useState(52);

  const title = useMemo(() => ({
    lobby: "Game Lobby", create: "Create Table", tournaments: "Tournaments", profile: "Player Profile"
  }[view] || "Pedro Online"), [view]);

  if (view === "login") {
    return <main className="login-shell">
      <section className="brand-panel">
        <div className="brand-mark">P</div>
        <p className="eyebrow">SOUTHERN CARD GAME</p>
        <h1>PEDRO</h1>
        <p className="gold script">Online</p>
        <p className="intro">Four players. Two teams. One bayou tradition.</p>
      </section>
      <section className="login-card panel">
        <p className="eyebrow gold">WELCOME TO THE TABLE</p>
        <h2>Sign in to play</h2>
        <label>Email address<input type="email" placeholder="you@example.com" /></label>
        <label>Password<input type="password" placeholder="Enter your password" /></label>
        <div className="row between small"><label className="check"><input type="checkbox" /> Remember me</label><button className="link">Forgot password?</button></div>
        <button className="primary full" onClick={() => setView("lobby")}>SIGN IN</button>
        <button className="secondary full">ACCEPT EMAIL INVITE</button>
        <p className="small muted center">Accounts will be created through email invitation.</p>
      </section>
    </main>;
  }

  if (view === "game") return <GameTable onLeave={() => setView("lobby")} ruleMode={ruleMode} />;

  return <main className="app-shell">
    <header className="topbar">
      <button className="logo" onClick={() => setView("lobby")}><span>P</span><div>PEDRO<small>ONLINE</small></div></button>
      <div className="header-title">{title}</div>
      <div className="player-chip"><span className="avatar">CV</span><div><b>CajunPlayer</b><small>Online</small></div></div>
    </header>

    <div className="workspace">
      <aside className="sidebar panel">
        <button className={view === "lobby" ? "active" : ""} onClick={() => setView("lobby")}>⌂ Lobby</button>
        <button className={view === "create" ? "active" : ""} onClick={() => setView("create")}>＋ Create Table</button>
        <button onClick={() => setView("lobby")}>⇥ Join Table</button>
        <button className={view === "tournaments" ? "active" : ""} onClick={() => setView("tournaments")}>♛ Tournaments</button>
        <button className={view === "profile" ? "active" : ""} onClick={() => setView("profile")}>♙ Profile</button>
        <div className="sidebar-foot"><span className="status-dot" /> Connected</div>
      </aside>

      <section className="content">
        {view === "lobby" && <>
          <div className="hero panel"><div><p className="eyebrow gold">WELCOME BACK</p><h2>Find your seat at the table</h2><p className="muted">Create a private room for friends or join an open South Louisiana table.</p></div><button className="primary" onClick={() => setView("create")}>＋ CREATE TABLE</button></div>
          <div className="section-head"><div><p className="eyebrow">AVAILABLE NOW</p><h3>Open Tables</h3></div><button className="secondary">Refresh</button></div>
          <div className="table-list panel">
            <div className="table-row table-head"><b>TABLE</b><b>HOST</b><b>RULES</b><b>SCORE</b><b>PLAYERS</b><b></b></div>
            {openTables.map((table) => <div className="table-row" key={table.name}><div><b>{table.name}</b><small>{table.players === "4/4" ? "Spectators allowed" : "Seat available"}</small></div><span>{table.host}</span><span className="rule-badge">{table.rules}</span><span>{table.score}</span><span>{table.players}</span><button className={table.players === "4/4" ? "secondary" : "join"} onClick={() => setView("game")}>{table.players === "4/4" ? "WATCH" : "JOIN"}</button></div>)}
          </div>
        </>}

        {view === "create" && <div className="form-card panel">
          <p className="eyebrow gold">NEW GAME ROOM</p><h2>Create a Pedro Table</h2><p className="muted">Choose the rules before inviting players. Rules lock when the first hand begins.</p>
          <label>Table name<input value={tableName} onChange={e => setTableName(e.target.value)} /></label>
          <div className="field"><span>Table visibility</span><div className="choice-grid"><button className={!isPrivate ? "selected" : ""} onClick={() => setIsPrivate(false)}>◉ Public</button><button className={isPrivate ? "selected" : ""} onClick={() => setIsPrivate(true)}>▣ Private</button></div></div>
          {isPrivate && <label>Private room code<div className="code-field"><input value="BAYOU24" readOnly /><button>↻</button></div></label>}
          <div className="field"><span>Play style</span><div className="choice-grid"><button className={ruleMode === "follow" ? "selected" : ""} onClick={() => setRuleMode("follow")}>Follow Suit<small>Players follow the led suit when able</small></button><button className={ruleMode === "cut" ? "selected" : ""} onClick={() => setRuleMode("cut")}>Cut-Throat<small>All cards remain available to play</small></button></div></div>
          <label>Winning score<select value={score} onChange={e => setScore(Number(e.target.value))}><option value={52}>52 points</option><option value={64}>64 points</option></select></label>
          <div className="setting-row"><div><b>First trick must lead trump</b><small>Require the pitcher to open with trump</small></div><input type="checkbox" defaultChecked /></div>
          <div className="setting-row"><div><b>Trump 2 belongs to</b><small>Choose the scoring house rule</small></div><select><option>Team that was dealt it</option><option>Team that captures it</option></select></div>
          <button className="primary full" onClick={() => setView("game")}>CREATE TABLE</button>
        </div>}

        {view === "tournaments" && <>
          <div className="hero panel"><div><p className="eyebrow gold">COMPETITIVE PLAY</p><h2>Pedro Tournaments</h2><p className="muted">Register a team, follow the bracket, and compete for the championship.</p></div><button className="primary">CREATE TOURNAMENT</button></div>
          <div className="tournament-grid">
            <div className="panel tournament-list"><h3>Upcoming Tournaments</h3>{["Bayou Classic","Cajun Showdown","Golden Meadow Open","Thibodaux Throwdown"].map((n,i)=><div className="tournament-row" key={n}><div><b>{n}</b><small>{["32 / 64 players","18 / 32 players","12 / 64 players","8 / 32 players"][i]}</small></div><span className="rule-badge">Registration Open</span><button className="join">JOIN</button></div>)}</div>
            <div className="panel bracket"><h3>Bayou Classic Bracket</h3><div className="bracket-lines"><div><span>Team Bayou</span><span>Cut Off Kings</span><span>Larose Aces</span><span>Delta Crew</span></div><div><span>Semifinal A</span><span>Semifinal B</span></div><div><span>♛ Final</span></div></div></div>
          </div>
        </>}

        {view === "profile" && <div className="profile-grid">
          <div className="profile-main panel"><div className="profile-avatar">CV</div><h2>CajunPlayer</h2><p className="gold">Level 12</p><button className="secondary">EDIT PROFILE</button></div>
          <div className="stats-grid">{[["Games Played","124"],["Games Won","78"],["Win Rate","62.9%"],["Tournaments Won","5"],["Total Points","4,362"],["Best Score","64"]].map(([k,v])=><div className="panel stat" key={k}><small>{k}</small><b>{v}</b></div>)}</div>
          <div className="panel achievements"><h3>Achievements</h3><div><span>🏆<small>First Win</small></span><span>♥<small>High Roller</small></span><span>♛<small>Pedro Master</small></span></div></div>
        </div>}
      </section>
    </div>
  </main>;
}
