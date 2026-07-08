import { useEffect, useRef, useState } from "react";
// import { useChatProvider } from "../../../context/ChatContext";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h ? h + ":" : ""}${m < 10 && h ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
};

const TypingDots = ({ label = "Typing..." }) => (
  <div className="flex items-center gap-2 px-1">
    <div className="flex gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
          style={{ animation: `typingBounce .8s ${delay}ms infinite` }}
        />
      ))}
    </div>
    <span className="text-[11px] text-gray-400 italic">{label}</span>
  </div>
);

const Avatar = ({
  initials,
  size = "md",
  variant = "indigo",
  className = "",
}) => {
  const sizes = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };
  const variants = {
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-400 text-white",
    amber: "bg-gradient-to-br from-amber-400 to-yellow-300 text-amber-900",
    violet: "bg-gradient-to-br from-violet-500 to-purple-400 text-white",
  };
  return (
    <div
      className={`${sizes[size]} ${variants[variant]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
};

const DashboardBubble = ({ message }) => {
  const isAgent = message.role === "agent";
  return (
    <div
      className={`flex gap-2.5 items-start msg-enter ${isAgent ? "flex-row-reverse" : ""}`}
    >
      <Avatar
        initials={isAgent ? "SR" : "JO"}
        size="sm"
        variant={isAgent ? "indigo" : "amber"}
      />
      <div
        className={`flex flex-col gap-1 max-w-[68%] ${isAgent ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-[1.55] break-words ${
            isAgent
              ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-sm"
              : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

const SystemMessage = ({ text }) => (
  <div className="flex items-center gap-3 py-1" role="note">
    <div className="flex-1 h-px bg-gray-100" />
    <span className="text-[10.5px] text-gray-400 flex-shrink-0">{text}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const CenterColumn = () => {
  const {
    messages,
    isVisitorTyping,
    sendAgentMessage,
    activeConversations,
    activeConversationId,
  } = useChatProvider();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef(null);

  const activeConvo = activeConversations.find(
    (c) => c.id === activeConversationId,
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isVisitorTyping]);

  const handleSend = () => {
    sendAgentMessage(input);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Conversation header */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <Avatar
          initials={activeConvo?.initials ?? "?"}
          size="md"
          variant="amber"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-semibold text-gray-800 truncate">
            {activeConvo?.visitorName ?? "Unknown visitor"}
          </h3>
          <p className="text-[11px] text-gray-400 truncate">
            {activeConvo?.email} · {activeConvo?.plan} Plan
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="text-[11px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Transfer
          </button>
          <button className="text-[11px] text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-50 transition-colors flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Resolve
          </button>
          <button className="text-[11px] text-red-500 hover:text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition-colors flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Close
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 flex flex-col gap-3">
        <SystemMessage
          text={`Conversation started · ${formatTime(messages[0]?.timestamp ?? Date.now())}`}
        />
        {messages.map((m) => (
          <DashboardBubble key={m.id} message={m} />
        ))}
        {isVisitorTyping && (
          <div className="flex gap-2.5 items-end msg-enter">
            <Avatar initials="JO" size="sm" variant="amber" />
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-3 py-2.5">
              <TypingDots label="James is typing..." />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Footer composer */}
      <footer className="bg-white border-t border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Reply to ${activeConvo?.visitorName ?? "visitor"}…`}
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 pb-8 text-[12.5px] text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all leading-snug"
            style={{ minHeight: "72px", maxHeight: "160px" }}
          />
          <span className="absolute bottom-2.5 left-3.5 text-[10px] text-gray-300 pointer-events-none font-mono">
            ⌘ + Enter to send
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[
              {
                icon: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
                label: "Attach file",
              },
              {
                icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
                label: "Canned response",
              },
              {
                icon: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
                label: "Note",
              },
              {
                icon: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01",
                label: "Emoji",
              },
            ].map(({ icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d={icon} />
                </svg>
              </button>
            ))}
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
          >
            Send Reply
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </footer>
    </main>
  );
};

const MetaRow = ({ label, value, mono = false }) => (
  <div className="flex items-start justify-between gap-2 mb-1.5">
    <span className="text-[11px] text-gray-400 flex-shrink-0">{label}</span>
    <span
      className={`text-[11px] font-medium text-gray-700 text-right break-all ${mono ? "font-mono text-[10.5px]" : ""}`}
    >
      {value}
    </span>
  </div>
);

const MetaSectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 mb-2.5 mt-0">
    <span className="text-[9px] font-bold tracking-widest uppercase text-gray-300">
      {children}
    </span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const RightSidebar = () => {
  const { visitorMeta, sessionSeconds } = useChatProvider();

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-white border-l border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
          Visitor Context
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-4">
        {/* Profile */}
        <section aria-label="Visitor profile">
          <MetaSectionTitle>Profile</MetaSectionTitle>
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar initials={visitorMeta.initials} size="md" variant="amber" />
            <div>
              <p className="text-[13px] font-semibold text-gray-800">
                {visitorMeta.name}
              </p>
              <p className="text-[10px] text-gray-400">
                Customer since {visitorMeta.customerSince}
              </p>
            </div>
          </div>
          <MetaRow label="Email" value={visitorMeta.email} mono />
          <MetaRow
            label="Plan"
            value={
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                ⭐ {visitorMeta.plan}
              </span>
            }
          />
          <MetaRow
            label="Tickets"
            value={`${visitorMeta.totalTickets} total · ${visitorMeta.openTickets} open`}
          />
        </section>

        {/* Session */}
        <section aria-label="Session info">
          <MetaSectionTitle>Live Session</MetaSectionTitle>
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2.5 border border-gray-100">
            <p className="text-[9px] text-gray-400 mb-0.5">Current URL</p>
            <p className="text-[10.5px] font-mono text-indigo-600 break-all">
              {visitorMeta.liveUrl}
            </p>
          </div>
          <MetaRow
            label="Duration"
            value={formatDuration(sessionSeconds)}
            mono
          />
          <MetaRow
            label="Pages viewed"
            value={`${visitorMeta.pagesThisSession} this session`}
          />
        </section>

        {/* Location & Device */}
        <section aria-label="Location and device">
          <MetaSectionTitle>Location &amp; Device</MetaSectionTitle>
          <MetaRow
            label="Location"
            value={
              <span>
                {visitorMeta.flag} {visitorMeta.location}
              </span>
            }
          />
          <MetaRow label="IP" value={visitorMeta.ip} mono />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {[
              {
                icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
                label: visitorMeta.browser,
              },
              {
                icon: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M8 21h8 M12 17v4",
                label: visitorMeta.os,
              },
            ].map(({ label }) => (
              <span
                key={label}
                className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Engagement stats */}
        <section aria-label="Engagement metrics">
          <MetaSectionTitle>Engagement</MetaSectionTitle>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { val: visitorMeta.pagesThisSession, label: "Pages" },
              { val: visitorMeta.avgCsat.toFixed(1), label: "Avg CSAT" },
              { val: visitorMeta.chatsLast30d, label: "30d chats" },
              { val: `${visitorMeta.avgResponseSec}s`, label: "Avg resp." },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="bg-gray-50 rounded-lg p-2 border border-gray-100 text-center"
              >
                <p className="text-[16px] font-semibold text-gray-800 leading-tight">
                  {val}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Activity bar chart */}
          <p className="text-[9.5px] text-gray-400 mb-1.5">
            Page activity (last {visitorMeta.pageActivity.length} visits)
          </p>
          <div
            className="flex items-end gap-1 h-8"
            role="img"
            aria-label="Page activity bar chart"
          >
            {visitorMeta.pageActivity.map((pct, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all ${
                  i >= visitorMeta.pageActivity.length - 4
                    ? "bg-indigo-500"
                    : "bg-indigo-200"
                }`}
                style={{ height: `${pct}%` }}
                aria-label={`${pct}% activity`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[8.5px] text-gray-300">oldest</span>
            <span className="text-[8.5px] text-gray-300">current</span>
          </div>
        </section>

        {/* Referrer / UTM stub */}
        <section aria-label="Acquisition info">
          <MetaSectionTitle>Acquisition</MetaSectionTitle>
          <MetaRow label="Source" value="organic / google" mono />
          <MetaRow label="Medium" value="search" />
          <MetaRow label="Visits (total)" value="24" />
        </section>
      </div>
    </aside>
  );
};

const Support = () => {
  return (
    <div>
      <h1>Support Page</h1>
      <p>If you need assistance, please contact our support team.</p>

      <div
        className="grid h-screen overflow-hidden"
        style={{ gridTemplateColumns: "260px 1fr 268px" }}
      >
        {/* <LeftSidebar /> */}
        <CenterColumn />
        <RightSidebar />
      </div>
    </div>
  );
};

export default Support;
