import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, X } from 'lucide-react';
import { FALLBACK, INTENTS, SUGGESTIONS } from '../data/intents';
import { buildAnswer } from '../lib/answers';
import { matchIntent } from '../lib/matcher';
import styles from './ChatWidget.module.css';

const REPLY_DELAY_MS = 450;
const MAX_LENGTH = 200;

let nextId = 0;
const newId = () => `m${(nextId += 1)}`;

// Mensaje de bienvenida: no es una intención, el saludo `greeting` es la
// respuesta cuando el turista escribe «Hola».
const WELCOME = { id: newId(), from: 'bot', welcome: true };

/** Texto y enlace de un mensaje del asistente, en el idioma actual. */
function BotMessage({ message, t, onNavigate }) {
  const answer = message.welcome
    ? { text: t('chatbot.welcome'), link: null }
    : buildAnswer(message.intent, t);
  const { link } = answer;

  return (
    <div className={`${styles.bubble} ${styles.bot}`}>
      <p className={styles.text}>{answer.text}</p>
      {link?.kind === 'route' && (
        <Link to={link.to} className={styles.link} onClick={onNavigate}>
          {link.label}
        </Link>
      )}
      {link?.kind === 'external' && (
        <a href={link.href} className={styles.link} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      )}
    </div>
  );
}

/**
 * Asistente de preguntas frecuentes del turista, con respuestas predefinidas.
 * No usa servidor: reconoce palabras clave del mensaje (ver lib/matcher.js).
 */
export default function ChatWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(0);
  const timers = useRef(new Set());
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach((id) => clearTimeout(id));
  }, []);

  // Al abrir, el cursor queda en el campo de texto.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // El historial se mantiene al final cuando llega un mensaje.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending, open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') close();
  };

  const reply = (intent) => {
    setPending((n) => n + 1);
    const id = setTimeout(() => {
      timers.current.delete(id);
      setPending((n) => n - 1);
      setMessages((list) => [...list, { id: newId(), from: 'bot', intent }]);
    }, REPLY_DELAY_MS);
    timers.current.add(id);
  };

  const send = (text, intentId) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((list) => [...list, { id: newId(), from: 'user', text: clean }]);
    reply(intentId ?? matchIntent(clean, INTENTS) ?? FALLBACK.id);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    send(draft);
    setDraft('');
  };

  return (
    <div className={styles.root} onKeyDown={onKeyDown}>
      {open && (
        <section className={styles.panel} role="dialog" aria-label={t('chatbot.title')}>
          <header className={styles.header}>
            <div>
              <h2 className={styles.title}>{t('chatbot.title')}</h2>
              <p className={styles.subtitle}>{t('chatbot.subtitle')}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label={t('chatbot.close')}
              onClick={close}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div
            ref={logRef}
            className={styles.log}
            role="log"
            aria-live="polite"
            aria-label={t('chatbot.log')}
          >
            {messages.map((message) =>
              message.from === 'user' ? (
                <div key={message.id} className={`${styles.bubble} ${styles.user}`}>
                  <p className={styles.text}>{message.text}</p>
                </div>
              ) : (
                <BotMessage
                  key={message.id}
                  message={message}
                  t={t}
                  onNavigate={() => setOpen(false)}
                />
              ),
            )}
            {pending > 0 && (
              <div className={`${styles.bubble} ${styles.bot} ${styles.typing}`}>
                <span className={styles.srOnly}>{t('chatbot.typing')}</span>
                <span className={styles.dots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          <div className={styles.chips} role="group" aria-label={t('chatbot.suggestions')}>
            {SUGGESTIONS.map((id) => (
              <button
                key={id}
                type="button"
                className={styles.chip}
                onClick={() => send(t(`chatbot.chips.${id}`), id)}
              >
                {t(`chatbot.chips.${id}`)}
              </button>
            ))}
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.srOnly} htmlFor="chat-input">
              {t('chatbot.inputLabel')}
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              className={styles.input}
              type="text"
              value={draft}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              placeholder={t('chatbot.placeholder')}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              className={styles.send}
              disabled={!draft.trim()}
              aria-label={t('chatbot.send')}
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-label={open ? t('chatbot.close') : t('chatbot.open')}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
        <span className={styles.toggleLabel} aria-hidden="true">
          {t('chatbot.toggle')}
        </span>
      </button>
    </div>
  );
}
