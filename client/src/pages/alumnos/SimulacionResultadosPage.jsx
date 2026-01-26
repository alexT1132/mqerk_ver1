import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSimulacion, listIntentosSimulacionEstudiante, getSimulacionIntentoReview } from '../../api/simulaciones';
import { ArrowLeft, Trophy, Clock, CheckCircle2, XCircle, Circle, Filter, Calendar, FileText } from 'lucide-react';
import InlineMath from '../../components/Asesor/simGen/InlineMath.jsx';

// Componente para renderizar texto con fórmulas LaTeX (igual que en Quizz_Review.jsx)
function MathText({ text = "" }) {
  if (!text) return null;

  const sanitizeHtmlLite = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'br'];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodesToRemove = [];
    let node;
    while (node = walker.nextNode()) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      }
    }
    nodesToRemove.forEach(n => {
      const parent = n.parentNode;
      while (n.firstChild) {
        parent.insertBefore(n.firstChild, n);
      }
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  let processedText = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  processedText = processedText.replace(/×/g, '\\times').replace(/÷/g, '\\div');
  
  const latexPlaceholder = '___LATEX_PLACEHOLDER___';
  const latexMatches = [];
  let placeholderIndex = 0;
  
  processedText = processedText.replace(/\$([^$]+?)\$/g, (match) => {
    const placeholder = `${latexPlaceholder}${placeholderIndex}___`;
    latexMatches.push(match);
    placeholderIndex++;
    return placeholder;
  });
  
  processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  
  latexMatches.forEach((match, idx) => {
    processedText = processedText.replace(`${latexPlaceholder}${idx}___`, match);
  });

  const re = /\$([^$]+?)\$/g;
  const parts = [];
  let lastIndex = 0;
  let m;
  let matchFound = false;

  re.lastIndex = 0;

  while ((m = re.exec(processedText)) !== null) {
    matchFound = true;
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: processedText.slice(lastIndex, m.index) });
    }
    const formula = m[1].trim();
    if (formula) {
      parts.push({ type: 'math', content: formula });
    }
    lastIndex = m.index + m[0].length;
  }
  
  if (lastIndex < processedText.length) {
    parts.push({ type: 'text', content: processedText.slice(lastIndex) });
  }

  if (!matchFound || parts.length === 0) {
    return (
      <span 
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processedText) }}
      />
    );
  }

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <span key={`math-${idx}`} className="inline-block">
            <InlineMath math={part.content} />
          </span>
        ) : (
          <span 
            key={`text-${idx}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(part.content) }}
          />
        )
      )}
    </span>
  );
}

const RETURN_STORAGE_KEY = 'sim_return_to';
const NO_REVIEW_STORAGE_PREFIX = 'sim_review_missing';

export default function SimulacionResultadosPage() {
	const { simId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { alumno, user } = useAuth() || {};
	const estudianteId = alumno?.id || user?.id_estudiante || user?.id || null;

	const returnToTarget = location.state?.returnTo || null;
	const attemptFromStateRaw = location.state?.attempt ?? location.state?.attemptNumber ?? location.state?.intento ?? null;
	const attemptFromStateNum = Number(attemptFromStateRaw);
	const preselectedAttempt = Number.isFinite(attemptFromStateNum) && attemptFromStateNum > 0 ? attemptFromStateNum : null;

	const [simulacion, setSimulacion] = useState(() => location.state?.simulacion || null);
	const [intentos, setIntentos] = useState([]);
	const [loadingMeta, setLoadingMeta] = useState(false);
	const [metaError, setMetaError] = useState('');

	const [intentoSel, setIntentoSel] = useState(null);
	const [review, setReview] = useState(null);
	const [loadingReview, setLoadingReview] = useState(false);
	const [reviewError, setReviewError] = useState('');
	const [reviewHint, setReviewHint] = useState(null);
	const [filtro, setFiltro] = useState('all');
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const [refreshNonce, setRefreshNonce] = useState(0);

	const reviewCacheRef = useRef(new Map());
	const noReviewKey = useMemo(() => (
		estudianteId && simId ? `${NO_REVIEW_STORAGE_PREFIX}:${estudianteId}:${simId}` : null
	), [estudianteId, simId]);

	useEffect(() => {
		if (!returnToTarget) return;
		try {
			sessionStorage.setItem(RETURN_STORAGE_KEY, returnToTarget);
		} catch (err) {
			if (import.meta.env?.DEV) console.warn('No se pudo guardar returnTo en sessionStorage', err);
		}
	}, [returnToTarget]);

	useEffect(() => {
		if (!estudianteId || !simId) return;

		setLoadingMeta(true);
		setMetaError('');
		Promise.all([
			getSimulacion(simId),
			listIntentosSimulacionEstudiante(simId, estudianteId)
		])
			.then(([sres, ires]) => {
				const sdata = sres?.data?.data || sres?.data || null;
				if (sdata) setSimulacion(sdata);
				const rawIntentos = Array.isArray(ires?.data?.data) ? ires.data.data : (Array.isArray(ires?.data) ? ires.data : []);
				const intentosMapeados = rawIntentos.map((it, idx) => {
					const numero = Number(it.intent_number ?? it.numero ?? idx + 1) || (idx + 1);
					const tiempoSeg = (() => {
						const direct = Number(it.tiempo_segundos ?? it.duration_sec);
						if (Number.isFinite(direct) && direct >= 0) return direct;
						const elapsed = Number(it.elapsed_ms ?? it.tiempo_ms);
						if (Number.isFinite(elapsed) && elapsed > 0) return Math.round(elapsed / 1000);
						return null;
					})();
					return {
						id: it.id || `${idx + 1}`,
						numero,
						fecha: it.finished_at || it.updated_at || it.created_at || null,
						puntaje: Number(it.puntaje ?? 0),
						tiempoEmpleado: tiempoSeg,
					};
				}).sort((a, b) => a.numero - b.numero);
				setIntentos(intentosMapeados);

				// ✅ CRÍTICO: Solo establecer intentoSel si realmente no hay uno seleccionado
				// NO resetear si el usuario ya seleccionó uno manualmente
				if (intentosMapeados.length) {
					const numbers = intentosMapeados.map(i => i.numero);
					// Solo establecer si realmente no hay uno seleccionado o si el seleccionado no existe
					setIntentoSel(prev => {
						if (prev && numbers.includes(prev)) {
							// El intento seleccionado existe, mantenerlo
							return prev;
						}
						// No hay uno seleccionado o el seleccionado no existe, establecer uno nuevo
						const candidate = preselectedAttempt && numbers.includes(preselectedAttempt)
							? preselectedAttempt
							: numbers[numbers.length - 1];
						return candidate;
					});
				} else {
					setIntentoSel(null);
				}
			})
			.catch(() => setMetaError('No se pudo cargar la información de la simulación.'))
			.finally(() => setLoadingMeta(false));
		}, [simId, estudianteId, preselectedAttempt]);

		useEffect(() => {
			reviewCacheRef.current.clear();
		}, [simId, estudianteId]);

		useEffect(() => {
			const validNumbers = new Set(
				intentos
					.map(i => Number(i.numero))
					.filter(n => Number.isFinite(n) && n > 0)
			);
			const cache = reviewCacheRef.current;
			for (const key of Array.from(cache.keys())) {
				if (!validNumbers.has(key)) cache.delete(key);
			}
		}, [intentos]);

	useEffect(() => {
		const attemptNumbersDesc = Array.from(
			new Set(
				intentos
					.map(i => Number(i.numero))
					.filter(n => Number.isFinite(n) && n > 0)
			)
		).sort((a, b) => b - a);

		if (!estudianteId || !simId) {
			setReview(null);
			setReviewError('');
			setReviewHint(null);
			setLoadingReview(false);
			return;
		}

		// ✅ CRÍTICO: Solo establecer intentoSel automáticamente si realmente no hay uno seleccionado
		// NO resetear si el usuario ya seleccionó uno manualmente
		if (!intentoSel) {
			if (attemptNumbersDesc.length) {
				// Solo establecer el último intento si realmente no hay uno seleccionado
				setIntentoSel(attemptNumbersDesc[0]);
			} else {
				setReview(null);
				setReviewError('');
				setReviewHint(null);
				setLoadingReview(false);
			}
			return;
		}
		
		// ✅ CRÍTICO: Validar que el intento seleccionado existe en la lista de intentos disponibles
		// Si el usuario cambió a un intento que no existe, no hacer nada (mantener el seleccionado)
		if (!attemptNumbersDesc.includes(intentoSel)) {
			// El intento seleccionado no existe, pero no resetearlo - dejar que el usuario lo cambie manualmente
			return;
		}

		if (!refreshNonce && noReviewKey) {
			try {
				if (sessionStorage.getItem(noReviewKey) === '1') {
					setReview(null);
					setReviewError('');
					setReviewHint({ type: 'missing', cached: true });
					setLoadingReview(false);
					return;
				}
			} catch (err) {
				if (import.meta.env?.DEV) console.warn('No se pudo leer cache de review faltante', err);
			}
		}

		let cancelled = false;
		const requestedAttempt = intentoSel;
		const orderedAttempts = [requestedAttempt, ...attemptNumbersDesc.filter(n => n !== requestedAttempt)];
		const cache = reviewCacheRef.current;
		const summaryCandidates = [];
		const removeNoReviewFlag = () => {
			if (!noReviewKey) return;
			try {
				sessionStorage.removeItem(noReviewKey);
			} catch (err) {
				if (import.meta.env?.DEV) console.warn('No se pudo limpiar cache de review faltante', err);
			}
		};
		const storeNoReviewFlag = (value = '1') => {
			if (!noReviewKey) return;
			try {
				sessionStorage.setItem(noReviewKey, value);
			} catch (err) {
				if (import.meta.env?.DEV) console.warn('No se pudo guardar cache de review faltante', err);
			}
		};
		const handleCandidate = (attemptNumber, payload) => {
			if (!payload) return false;
			const fallbackReason = payload?.fallback?.reason || null;
			if (payload.detail_available === false) {
				summaryCandidates.push({ attemptNumber, data: payload });
				return false;
			}
			setReview(payload);
			setLoadingReview(false);
			if (attemptNumber !== requestedAttempt) {
				setReviewHint({ type: 'fallback', from: requestedAttempt, to: attemptNumber, reason: fallbackReason });
				setIntentoSel(attemptNumber);
			} else if (fallbackReason === 'analytics') {
				setReviewHint({ type: 'analytics', attempt: attemptNumber });
			} else {
				setReviewHint(prev => (prev?.type === 'fallback' ? prev : null));
			}
			removeNoReviewFlag();
			clearRefreshNonce();
			return true;
		};

		setReviewError('');
		setReviewHint(null);
		setLoadingReview(true);

		(async () => {
			for (const attemptNumber of orderedAttempts) {
				if (cancelled) return;
				if (cache.has(attemptNumber)) {
					const cached = cache.get(attemptNumber);
					if (handleCandidate(attemptNumber, cached)) {
						return;
					}
					if (cached) continue;
				}

				try {
					const resp = await getSimulacionIntentoReview(simId, estudianteId, attemptNumber);
					if (cancelled) return;
					const data = resp?.data?.data || resp?.data || null;
					cache.set(attemptNumber, data || null);
					if (handleCandidate(attemptNumber, data)) {
						return;
					}
					if (data) continue;
				} catch (err) {
					if (cancelled) return;
					if (err?.response?.status === 404) {
						cache.set(attemptNumber, null);
						continue;
					}
					cache.delete(attemptNumber);
					setReview(null);
					setReviewError('No se pudo cargar el detalle de este intento.');
					setReviewHint({ type: 'error' });
					setLoadingReview(false);
					clearRefreshNonce();
					return;
				}
			}

			if (!cancelled) {
				if (summaryCandidates.length) {
					const preferred = summaryCandidates.find(c => c.attemptNumber === requestedAttempt)
						|| summaryCandidates.reduce((acc, curr) => (acc && acc.attemptNumber > curr.attemptNumber ? acc : curr), null);
					if (preferred) {
						setReview(preferred.data);
						setReviewError('');
						setLoadingReview(false);
						const hintType = preferred.attemptNumber === requestedAttempt ? 'summary-only' : 'summary-fallback';
						setReviewHint({ type: hintType, from: requestedAttempt, to: preferred.attemptNumber });
						// ✅ CRÍTICO: NO cambiar intentoSel automáticamente - dejar que el usuario lo cambie manualmente
						storeNoReviewFlag('summary');
						clearRefreshNonce();
						return;
					}
				}
				setReview(null);
				setReviewError('Este intento no cuenta con detalle guardado. Intenta con otro intento anterior.');
				setReviewHint({ type: 'missing' });
				storeNoReviewFlag('missing');
				setLoadingReview(false);
				clearRefreshNonce();
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [simId, estudianteId, intentoSel, intentos, refreshNonce, noReviewKey]);

	// ✅ CRÍTICO: Leer intento de la URL solo cuando cambia location.search (navegación inicial)
	// NO incluir intentoSel en las dependencias para evitar loops cuando el usuario cambia el intento manualmente
	useEffect(() => {
		if (!intentos.length) return;
		const params = new URLSearchParams(location.search || '');
		const intentoParam = Number(params.get('intento'));
		const intentoFromUrl = Number.isFinite(intentoParam) && intentoParam > 0 ? intentoParam : null;
		// Solo establecer desde la URL si realmente viene en la URL y es diferente del actual
		// Esto permite que el usuario cambie el intento manualmente sin que se resetee
		if (intentoFromUrl && intentos.some(i => i.numero === intentoFromUrl)) {
			setIntentoSel(prev => {
				// Solo cambiar si realmente es diferente y viene de la URL (navegación inicial)
				if (prev !== intentoFromUrl) {
					return intentoFromUrl;
				}
				return prev; // Mantener el valor actual si el usuario ya lo cambió manualmente
			});
		}
	}, [location.search, intentos]); // ✅ Removido intentoSel de las dependencias

	const totalIntentos = intentos.length || Number(simulacion?.totalIntentos ?? simulacion?.total_intentos ?? 0);
	const mejorPuntaje = intentos.length
		? Math.max(...intentos.map(i => Number(i.puntaje || 0)))
		: Number(simulacion?.bestScore ?? simulacion?.mejor_puntaje ?? 0);
	const promedio = intentos.length
		? intentos.reduce((sum, i) => sum + Number(i.puntaje || 0), 0) / intentos.length
		: Number(simulacion?.promedio ?? 0);

	const intentoActual = intentoSel ? intentos.find(i => i.numero === intentoSel) : null;
	const puntajeIntento = review?.resumen?.puntaje ?? intentoActual?.puntaje ?? null;
	const tiempoIntento = review?.resumen?.tiempo_segundos ?? intentoActual?.tiempoEmpleado ?? null;

	const correctasIntento = useMemo(() => {
		if (review?.resumen?.correctas != null) return Number(review.resumen.correctas) || 0;
		if (!Array.isArray(review?.preguntas)) return 0;
		return review.preguntas.filter(p => p.correcta).length;
	}, [review]);

	const totalPreguntasIntento = useMemo(() => {
		if (review?.resumen?.total_preguntas != null) return Number(review.resumen.total_preguntas) || 0;
		return Array.isArray(review?.preguntas) ? review.preguntas.length : 0;
	}, [review]);

	const filtradas = useMemo(() => {
		if (!review?.preguntas) return [];
		if (filtro === 'correctas') return review.preguntas.filter(p => p.correcta);
		if (filtro === 'incorrectas') return review.preguntas.filter(p => !p.correcta);
		return review.preguntas;
	}, [review, filtro]);

	const formatDuration = (seconds) => {
		const value = Number(seconds);
		if (!Number.isFinite(value) || value <= 0) return '—';
		const sec = Math.round(value);
		if (sec < 60) return `${sec}s`;
		const mins = Math.floor(sec / 60);
		const remSec = sec % 60;
		if (mins < 60) return `${mins}m${remSec ? ` ${remSec}s` : ''}`;
		const hours = Math.floor(mins / 60);
		const remMins = mins % 60;
		return `${hours}h${remMins ? ` ${remMins}m` : ''}${remSec ? ` ${remSec}s` : ''}`;
	};

	const clearRefreshNonce = () => {
		setRefreshNonce(val => (val ? 0 : val));
	};

	const handleRetryReviewFetch = () => {
		if (noReviewKey) {
			try {
				sessionStorage.removeItem(noReviewKey);
			} catch (err) {
				if (import.meta.env?.DEV) console.warn('No se pudo limpiar cache de review faltante', err);
			}
		}
		reviewCacheRef.current.clear();
		setRefreshNonce(n => n + 1 || 1);
	};

	const handleGoBack = () => {
		const returnToFromState = location.state?.returnTo;
		let returnToFromSession = null;
		try {
			returnToFromSession = sessionStorage.getItem(RETURN_STORAGE_KEY);
		} catch (err) {
			if (import.meta.env?.DEV) console.warn('No se pudo leer returnTo desde sessionStorage', err);
			returnToFromSession = null;
		}
		const target = returnToFromState || returnToFromSession;
		if (target) {
			try {
				sessionStorage.removeItem(RETURN_STORAGE_KEY);
			} catch (err) {
				if (import.meta.env?.DEV) console.warn('No se pudo limpiar returnTo en sessionStorage', err);
			}
			navigate(target, { replace: true });
		} else {
			// Fallback a volver en el historial para mantener la posición/scroll anterior
			navigate(-1);
		}
	};

	const ScoreRing = ({ value = 0 }) => {
		const pct = Math.max(0, Math.min(100, Number(value) || 0));
		const color = pct < 50 ? '#ef4444' : pct < 70 ? '#f59e0b' : '#22c55e';
		const textTone = pct < 50 ? 'text-red-600' : pct < 70 ? 'text-amber-600' : 'text-green-600';
		const bg = `conic-gradient(${color} ${pct * 3.6}deg, #e5e7eb 0deg)`;
		return (
			<div className="relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 flex-none" title={`${pct}%`}>
				<div className="absolute inset-0 rounded-full" style={{ background: bg }} />
				<div className="absolute inset-1.5 lg:inset-2 bg-white rounded-full grid place-items-center shadow-inner">
					<div className="text-center">
						<div className={`text-base lg:text-lg font-bold ${textTone}`}>{Math.round(pct)}%</div>
						<div className="text-[9px] lg:text-[10px] text-gray-500">puntaje</div>
					</div>
				</div>
			</div>
		);
	};

	const toLocaleDate = (value) => {
		if (!value) return null;
		const date = new Date(value);
		if (!Number.isFinite(date.getTime())) return null;
		const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
		const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
		return `${dateStr} • ${timeStr}`;
	};

	const renderPregunta = (p, idx) => {
		const selected = new Set(p.seleccionadas || []);
		const isCorrect = !!p.correcta;
		const tipo = (p.tipo || '').replace(/_/g, ' ');
		return (
			<div key={p.id || idx} className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
				<div className="flex flex-col gap-2 sm:gap-3">
					<div className="flex items-start justify-between gap-3 sm:gap-4">
						<div className="min-w-0">
							<div className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
								Pregunta {p.orden ?? (idx + 1)}
							</div>
							<div className="mt-0.5 text-gray-900 font-semibold leading-6 text-sm sm:text-base">
								<MathText text={p.enunciado || p.pregunta || `Pregunta ${idx + 1}`} />
							</div>
						</div>
						<span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
							{isCorrect ? 'Correcta' : 'Incorrecta'}
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
						{tipo && <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md capitalize">{tipo}</span>}
						{typeof p.puntos === 'number' && (
							<span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-600">
								{p.puntos} punto{p.puntos === 1 ? '' : 's'}
							</span>
						)}
						{p.tiempo_ms ? (
							<span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
								<Clock className="w-3 h-3 text-gray-500" />
								{formatDuration(p.tiempo_ms / 1000)}
							</span>
						) : null}
					</div>
					<ul className="space-y-1.5 sm:space-y-2">
						{(p.opciones || []).map((o) => {
							const sel = selected.has(o.id);
							const corr = o.es_correcta === 1;
							const base = 'text-xs sm:text-sm rounded-lg border px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between transition-colors';
							const cl = sel && corr
								? 'bg-green-50 border-green-300'
								: sel && !corr
									? 'bg-red-50 border-red-300'
									: !sel && corr
										? 'bg-emerald-50 border-emerald-300'
										: 'bg-gray-50 border-gray-200 hover:bg-gray-100';
							return (
								<li key={o.id} className={`${base} ${cl}`}>
									<div className="flex items-center gap-2 min-w-0">
										{sel ? (
											corr ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
										) : (
											corr ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
										)}
										<span className="truncate">{o.texto}</span>
									</div>
									<div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
										{corr && <span className="text-emerald-700">Correcta</span>}
										{sel && <span className="text-blue-700">Marcada</span>}
									</div>
								</li>
							);
						})}
					</ul>
					{p.valor_texto && (
						<div className="text-[11px] sm:text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md">
						<span className="font-medium text-gray-700">Respuesta escrita:</span>{' '}
						<span className="text-gray-800"><MathText text={p.valor_texto} /></span>
						</div>
					)}
				</div>
			</div>
		);
	};

	const fechaLimite = simulacion?.fecha_limite ?? simulacion?.fechaEntrega ?? null;

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-6 overflow-x-hidden">
			<div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
				<div className="max-w-7xl mx-auto px-3 sm:px-4 max-[380px]:px-2 py-3 sm:py-4 flex items-center justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">Resultados de la Simulación</h1>
						<div className="text-white/90 text-xs sm:text-sm md:text-base truncate">{simulacion?.titulo || simulacion?.nombre || `Simulación #${simId}`}</div>
						{fechaLimite && (
							<div className="text-white/70 text-[10px] sm:text-xs flex items-center gap-1">
								<Calendar className="w-3.5 h-3.5" /> Fecha límite: {toLocaleDate(fechaLimite) || '—'}
							</div>
						)}
					</div>
					<button
						onClick={handleGoBack}
						className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs sm:text-sm"
					>
						<ArrowLeft className="w-4 h-4" /> <span className="max-[380px]:hidden">Volver</span>
					</button>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-3 sm:px-4 max-[380px]:px-2 py-4 sm:py-6 overflow-x-hidden">
				{simulacion?.descripcion && (
					<div className="bg-white/80 backdrop-blur rounded-xl border border-white/40 shadow-sm mb-4 p-3 sm:p-4 text-sm text-gray-700">
						{simulacion.descripcion}
					</div>
				)}
				{loadingMeta ? (
					<div className="text-gray-600">Cargando información…</div>
				) : metaError ? (
					<div className="text-red-600">{metaError}</div>
				) : (
					<>
						<div className="lg:sticky lg:top-0 z-10">
							<div className="bg-white/90 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-5">
								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
									<div className="flex items-center gap-3 sm:gap-4 min-w-0 max-w-full">
										<ScoreRing value={review ? (puntajeIntento || 0) : (mejorPuntaje || 0)} />
										<div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
											<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-700">
												<span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
													<span className="text-gray-500">Aciertos</span>
													<span className="font-semibold">{review ? `${correctasIntento}/${totalPreguntasIntento || '--'}` : '—'}</span>
												</span>
												<span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
													<span className="text-gray-500">Intentos</span>
													<span className="font-semibold">{totalIntentos || 0}</span>
												</span>
												<span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
													<Trophy className="w-4 h-4 text-amber-500" />
													<span className="text-gray-500">Mejor</span>
													<span className="font-semibold">{Number(mejorPuntaje || 0)}%</span>
												</span>
												<span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
													<span className="text-gray-500">Promedio</span>
													<span className="font-semibold">{Number.isFinite(promedio) ? promedio.toFixed(1) : '0.0'}%</span>
												</span>
												<span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
													<Clock className="w-4 h-4 text-indigo-500" />
													<span className="text-gray-500">Tiempo</span>
													<span className="font-semibold">{formatDuration(tiempoIntento)}</span>
												</span>
											</div>
											{intentoActual?.fecha && (
												<div className="text-[10px] sm:text-xs text-gray-500">
													Intento #{intentoSel} • {toLocaleDate(intentoActual.fecha) || '—'}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-3 w-full">
										{totalIntentos > 1 && (
											<div className="flex items-center gap-1.5 md:gap-2">
												<span className="font-medium text-xs md:text-sm text-gray-700 hidden sm:inline">Intento:</span>
												<select
													className="border rounded-md px-2 py-1 text-xs md:text-sm"
													value={intentoSel || ''}
													onChange={(e) => setIntentoSel(Number(e.target.value))}
												>
													{intentos.map(i => (
														<option key={i.id} value={i.numero}>#{i.numero}</option>
													))}
												</select>
											</div>
										)}
										<div className="hidden lg:flex items-center gap-2">
											<span className="text-sm text-gray-600">Filtrar:</span>
											<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
												<button onClick={() => setFiltro('all')} className={`px-3 py-1.5 text-xs rounded-md ${filtro === 'all' ? 'bg-white shadow border' : ''}`}>Todas</button>
												<button onClick={() => setFiltro('correctas')} className={`px-3 py-1.5 text-xs rounded-md ${filtro === 'correctas' ? 'bg-white shadow border' : ''}`}>Correctas</button>
												<button onClick={() => setFiltro('incorrectas')} className={`px-3 py-1.5 text-xs rounded-md ${filtro === 'incorrectas' ? 'bg-white shadow border' : ''}`}>Incorrectas</button>
											</div>
										</div>
										<button onClick={() => setMobileFiltersOpen(v => !v)} className="lg:hidden inline-flex items-center gap-1.5 px-2 py-1.5 text-xs bg-gray-100 rounded-md">
											<Filter className="w-4 h-4" />
											<span className="sr-only">Abrir filtros</span>
										</button>
									</div>
								</div>
							</div>
						</div>
						{reviewHint?.type === 'fallback' && (
							<div className="mb-4 text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
								No encontramos el detalle del intento #{reviewHint.from ?? '?'}. Mostramos el intento #{reviewHint.to ?? '?'} como referencia.
							</div>
						)}
						{reviewHint?.type === 'analytics' && (
							<div className="mb-4 text-xs sm:text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
								Reconstruimos los resultados de este intento a partir del historial guardado. Si notas datos incorrectos, avisa a tu asesor.
							</div>
						)}
						{reviewHint?.type === 'summary-fallback' && (
							<div className="mb-4 text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
								No hay análisis detallado del intento #{reviewHint.from ?? '?'}. Te mostramos el resumen general del intento #{reviewHint.to ?? '?'}.
							</div>
						)}
						{reviewHint?.type === 'summary-only' && (
							<div className="mb-4 text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
								Este intento solo cuenta con el resumen general. Aún no hay preguntas detalladas guardadas.
							</div>
						)}
						{reviewHint?.type === 'missing' && (
							<div className="mb-4 text-xs sm:text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
								<span>
									{reviewHint.cached
										? 'La última vez no encontramos análisis guardado. Usa “Reintentar” si ya debería estar disponible.'
										: 'Aún no hay análisis guardado para tus intentos. Si acabas de concluir la simulación, espera unos minutos y vuelve a intentar.'}
								</span>
								<button
									onClick={handleRetryReviewFetch}
									className="self-start sm:self-auto inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white/70 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-white"
								>
									Reintentar búsqueda
								</button>
							</div>
						)}
						{mobileFiltersOpen && (
							<div className="lg:hidden bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-4">
								<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full justify-between">
									<button onClick={() => setFiltro('all')} className={`flex-1 mx-0.5 px-2 py-1.5 text-xs rounded-md ${filtro === 'all' ? 'bg-white shadow border' : ''}`}>Todas</button>
									<button onClick={() => setFiltro('correctas')} className={`flex-1 mx-0.5 px-2 py-1.5 text-xs rounded-md ${filtro === 'correctas' ? 'bg-white shadow border' : ''}`}>Correctas</button>
									<button onClick={() => setFiltro('incorrectas')} className={`flex-1 mx-0.5 px-2 py-1.5 text-xs rounded-md ${filtro === 'incorrectas' ? 'bg-white shadow border' : ''}`}>Incorrectas</button>
								</div>
							</div>
						)}
						{loadingReview ? (
							<div className="text-gray-600">Cargando intento…</div>
						) : reviewError ? (
							<div className="text-red-600">{reviewError}</div>
						) : review && Array.isArray(review.preguntas) ? (
							filtradas.length ? (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
									{filtradas.map((p, idx) => (
										<div key={p.id || idx}>{renderPregunta(p, idx)}</div>
									))}
								</div>
							) : (
								<div className="text-gray-500">No hay preguntas bajo este filtro.</div>
							)
						) : (
							<div className="text-gray-500 flex flex-col items-center gap-2">
								<FileText className="w-10 h-10 text-gray-400" />
								<p>No hay detalles disponibles para este intento.</p>
							</div>
						)}
						{!intentos.length && !loadingReview && !review && (
							<div className="mt-6 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
								<FileText className="w-5 h-5 text-gray-400" />
								Aún no hay intentos registrados para esta simulación. Completa la simulación para ver tus resultados.
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
