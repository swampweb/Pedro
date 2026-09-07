"use client";

import { useMemo, useState } from "react";

type Card = { id: string; rank: string; suit: string; label?: string; pts?: number };
const starter: Card[] = [
  {id:"h5",rank:"5",suit:"♥",label:"HIGH PEDRO",pts:5},
  {id:"d5",rank:"5",suit:"♦",label:"LOW PEDRO",pts:5},
  {id:"ha",rank:"A",suit:"♥",pts:1},
  {id:"hk",rank:"K",suit:"♥"},
  {id:"hq",rank:"Q",suit:"♥"},
  {id:"hj",rank:"J",suit:"♥",pts:1},
  {id:"h10",rank:"10",suit:"♥",pts:1},
  {id:"ca",rank:"A",suit:"♣",pts:1},
  {id:"ck",rank:"K",suit:"♣"},
];

export default function GameTable({onLeave, ruleMode}:{onLeave:()=>void;ruleMode:"follow"|"cut"}) {
  const [cards,setCards]=useState(starter);
  const [dragged,setDragged]=useState<number|null>(null);
  const [selected,setSelected]=useState<string|null>(null);
  const [played,setPlayed]=useState<Card[]>([{id:"c10",rank:"10",suit:"♣"},{id:"h10x",rank:"10",suit:"♥"},{id:"d10",rank:"10",suit:"♦"}]);
  const selectedCard=useMemo(()=>cards.find(c=>c.id===selected),[cards,selected]);
  const move=(to:number)=>{if(dragged===null||dragged===to)return;const next=[...cards];const [item]=next.splice(dragged,1);next.splice(to,0,item);setCards(next);setDragged(null)};
  const play=()=>{if(!selectedCard)return;setPlayed(p=>[...p,selectedCard]);setCards(c=>c.filter(x=>x.id!==selectedCard.id));setSelected(null)};
  const CardView=({card,small=false}:{card:Card;small?:boolean})=><button className={`playing-card ${small?"small-card":""} ${selected===card.id?"picked":""} ${(card.suit==="♥"||card.suit==="♦")?"red":"black"}`} onClick={()=>setSelected(card.id)}><span className="corner">{card.rank}<i>{card.suit}</i></span><strong>{card.suit}</strong>{card.label&&<em>{card.label}</em>}{card.pts&&<b>{card.pts} PT</b>}</button>;
  return <main className="game-shell">
    <header className="topbar"><button className="logo"><span>P</span><div>PEDRO<small>ONLINE</small></div></button><div className="room-title"><b>Bayou Good Times</b><small>Private Room · BAYOU24</small></div><button className="secondary" onClick={onLeave}>LEAVE TABLE</button></header>
    <div className="game-layout">
      <aside className="game-panel panel"><p className="eyebrow">SCOREBOARD</p><div className="team-score red-team"><small>TEAM 1 · YOU</small><b>28</b></div><div className="team-score blue-team"><small>TEAM 2</small><b>24</b></div><div className="match-facts"><span>HAND <b>7</b></span><span>DEALER <b>East</b></span><span>PITCHER <b>South</b></span></div><div className="chat"><p><b>PoppaT:</b> Good luck y'all!</p><p><b>Lafitte:</b> Let's get it!</p><input placeholder="Type a message..." /></div></aside>
      <section className="felt-wrap">
        <div className="felt-table">
          <Player pos="north" name="TroutMan" cards={6}/><Player pos="west" name="Lafitte" cards={5}/><Player pos="east" name="PoppaT" cards={4}/>
          <div className="trick-area">{played.map((c,i)=><div key={c.id} className={`trick-card play-${i}`}><CardView card={c} small/></div>)}</div>
          <div className="your-seat"><div className="you-chip">CV</div><b>CajunPlayer</b><span>YOUR TURN</span></div>
          <div className="hand">{cards.map((card,i)=><div key={card.id} draggable onDragStart={()=>setDragged(i)} onDragOver={e=>e.preventDefault()} onDrop={()=>move(i)} className="hand-card" style={{transform:`rotate(${(i-(cards.length-1)/2)*2.2}deg) translateY(${Math.abs(i-(cards.length-1)/2)*2}px)`}}><CardView card={card}/></div>)}</div>
        </div>
        <div className="actionbar panel"><div><p className="eyebrow gold">TABLE MESSAGE</p><b>{selectedCard?`${selectedCard.rank}${selectedCard.suit} selected. Drag cards to rearrange your hand.`:`Your turn. Drag cards to arrange your hand.`}</b></div><div className="row"><button className="secondary" onClick={()=>setCards([...cards].sort((a,b)=>a.suit.localeCompare(b.suit)||a.rank.localeCompare(b.rank)))}>SORT BY SUIT</button><button className="primary" disabled={!selectedCard} onClick={play}>PLAY SELECTED CARD</button></div></div>
      </section>
      <aside className="game-panel panel"><p className="eyebrow">CURRENT HAND</p><div className="trump-box"><small>TRUMP</small><b>♥</b><span>Hearts</span></div><div className="info-card"><small>RULES</small><b>{ruleMode==="follow"?"Follow Suit":"Cut-Throat"}</b></div><div className="info-card"><small>WINNING BID</small><b>8 · Team 1</b></div><div className="info-card"><small>POINTS LEFT</small><b>4</b></div><h3>Hand History</h3>{[[1,"Team 1","+10"],[2,"Team 2","+8"],[3,"Team 1","+6"],[4,"Team 2","-7"]].map(r=><div className="history-row" key={r[0]}><span>Hand {r[0]}</span><span>{r[1]}</span><b>{r[2]}</b></div>)}</aside>
    </div>
  </main>
}
function Player({pos,name,cards}:{pos:string;name:string;cards:number}){return <div className={`seat ${pos}`}><div className="seat-avatar">{name.slice(0,2).toUpperCase()}</div><b>{name}</b><div className="card-backs">{Array.from({length:Math.min(cards,5)}).map((_,i)=><i key={i}/>)}</div></div>}
