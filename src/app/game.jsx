
"use client";

import { useState, useEffect } from "react";

export default function Game() {
    const [codigo, setCodigo] = useState("");
    const [valorDigitado, setValorDigitado] = useState("");

    const [nivel, setNivel] = useState(1);
    const [digito, setDigito] = useState(4);

    const [acertosSeguidos, setAcertosSeguidos] = useState(0);
    const [errosSeguidos, setErrosSeguidos] = useState(0);

    const [tentativas, setTentativas] = useState([]);
    const [numTentativas, setNumTentativas] = useState(0);

    const [recorde, setRecorde] = useState(1);

    const [fase, setFase] = useState("memorizar");
    const [mensagem, setMensagem] = useState("");
    const [rodada, setRodada] = useState(0);

    // Tempo de exposição diminui conforme o nível aumenta
    const tempoExposicao = Math.max(1500, 5000 - (nivel - 1) * 250);

    // Recuperar recorde
    useEffect(() => {
        const salvo = Number(localStorage.getItem("memory-recorde")) || 1;
        setRecorde(salvo);
    }, []);

    // Gerar código e iniciar rodada
    useEffect(() => {
        const novoCodigo = Array.from(
            { length: digito },
            () => Math.floor(Math.random() * 10)
        ).join("");

        setCodigo(novoCodigo);
        setValorDigitado("");
        setFase("memorizar");

        const timer = setTimeout(() => {
            setFase("responder");
        }, tempoExposicao);

        return () => clearTimeout(timer);
    }, [rodada, digito, tempoExposicao]);

    // Preparar próxima rodada depois do feedback
    useEffect(() => {
        if (fase !== "resultado") return;

        const timer = setTimeout(() => {
            setRodada(prev => prev + 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [fase]);

    // Digitar números
    function digitar(numero) {
        if (fase !== "responder") return;
        if (valorDigitado.length >= digito) return;

        setValorDigitado(prev => prev + numero);
    }

    // Apagar último número
    function apagar() {
        setValorDigitado(prev => prev.slice(0, -1));
    }

    // Limpar campo
    function limpar() {
        setValorDigitado("");
    }

    // Verificar resposta
    function verificar() {
        if (fase !== "responder" || valorDigitado.length !== digito) return;

        const acertou = valorDigitado === codigo;

        setNumTentativas(prev => prev + 1);

        setTentativas(prev => [
            {
                correto: acertou,
                resposta: valorDigitado
            },
            ...prev
        ].slice(0, 8));

        setFase("resultado");

        if (acertou) {
            setMensagem("Muito bem! Código correto!");

            setErrosSeguidos(0);

            const novosAcertos = acertosSeguidos + 1;

            if (novosAcertos >= 5) {
                const novoNivel = nivel + 1;

                setNivel(novoNivel);
                setDigito(novoNivel + 3);

                setAcertosSeguidos(0);
                setErrosSeguidos(0);

                setMensagem("🚀 NÍVEL AUMENTADO!");

                if (novoNivel > recorde) {
                    setRecorde(novoNivel);
                    localStorage.setItem(
                        "memory-recorde",
                        String(novoNivel)
                    );
                }
            } else {
                setAcertosSeguidos(novosAcertos);
            }

        } else {
            setMensagem("Ops! Código incorreto!");

            setAcertosSeguidos(0);

            const novosErros = errosSeguidos + 1;

            if (novosErros >= 5) {
                if (nivel > 1) {
                    const novoNivel = nivel - 1;

                    setNivel(novoNivel);
                    setDigito(novoNivel + 3);

                    setMensagem("⬇️ Você voltou um nível!");
                } else {
                    setMensagem("Você chegou ao limite! Tente novamente.");
                }

                setErrosSeguidos(0);
                setAcertosSeguidos(0);

            } else {
                setErrosSeguidos(novosErros);
            }
        }
    }

    // Reiniciar jogo
    function reiniciar() {
        setNivel(1);
        setDigito(4);

        setAcertosSeguidos(0);
        setErrosSeguidos(0);

        setNumTentativas(0);
        setTentativas([]);

        setValorDigitado("");
        setMensagem("");

        setFase("memorizar");
        setRodada(prev => prev + 1);
    }

    return (
        <main className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-3 sm:p-6">

            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl">

                {/* Cabeçalho */}
                <header className="text-center mb-6">
                    <div className="text-4xl mb-2">🧠</div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        MEMORY
                        <span className="text-cyan-400"> CHALLENGE</span>
                    </h1>

                    <p className="text-slate-400 text-sm mt-2">
                        Teste sua memória e supere seus limites.
                    </p>
                </header>

                {/* Informações */}
                <section className="grid grid-cols-3 gap-2 mb-5">

                    <div className="bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Nível</p>
                        <p className="text-2xl font-bold text-cyan-400">
                            {nivel}
                        </p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Dígitos</p>
                        <p className="text-2xl font-bold">
                            {digito}
                        </p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Recorde</p>
                        <p className="text-2xl font-bold text-yellow-400">
                            {recorde}
                        </p>
                    </div>

                </section>

                {/* Área principal */}
                <section className="bg-slate-800 rounded-2xl p-5 mb-4 text-center">

                    <p className="text-sm text-slate-400 mb-3">
                        {fase === "memorizar"
                            ? "MEMORIZE O CÓDIGO"
                            : fase === "responder"
                                ? "DIGITE O CÓDIGO"
                                : "RESULTADO"
                        }
                    </p>

                    <div className="min-h-14 flex items-center justify-center">

                        <h2 className="text-3xl sm:text-4xl font-black tracking-[0.25em] text-cyan-300">
                            {fase === "memorizar"
                                ? codigo
                                : "*".repeat(digito)
                            }
                        </h2>

                    </div>

                    {fase === "memorizar" && (
                        <p className="text-xs text-yellow-400 mt-3 animate-pulse">
                            Observe com atenção!
                        </p>
                    )}

                    {fase === "responder" && (
                        <div className="mt-3">
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 w-full rounded-full" />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Sua vez!
                            </p>
                        </div>
                    )}

                    {fase === "resultado" && (
                        <p className={`mt-3 text-sm font-bold ${
                            mensagem.includes("incorreto")
                                ? "text-red-400"
                                : "text-green-400"
                        }`}>
                            {mensagem}
                        </p>
                    )}

                </section>

                {/* Campo de resposta */}
                <div className="bg-slate-800 rounded-xl p-3 mb-4">

                    <p className="text-xs text-slate-400 mb-2">
                        Sua resposta
                    </p>

                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-center min-h-12 text-xl tracking-[0.3em] font-bold text-white">
                        {valorDigitado || (
                            <span className="text-slate-600 text-sm tracking-normal">
                                Digite os números...
                            </span>
                        )}
                    </div>

                    <div className="text-right text-xs text-slate-500 mt-2">
                        {valorDigitado.length}/{digito}
                    </div>

                </div>

                {/* Teclado numérico */}
                <section className="grid grid-cols-3 gap-2">

                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(numero => (
                        <button
                            key={numero}
                            disabled={fase !== "responder" || valorDigitado.length >= digito}
                            onClick={() => digitar(String(numero))}
                            className="bg-slate-700 hover:bg-slate-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl h-12 sm:h-14 text-xl font-bold transition"
                        >
                            {numero}
                        </button>
                    ))}

                    <button
                        disabled={fase !== "responder" || !valorDigitado}
                        onClick={limpar}
                        className="bg-red-950 text-red-300 hover:bg-red-900 disabled:opacity-30 rounded-xl h-12 sm:h-14 font-bold transition"
                    >
                        C
                    </button>

                    <button
                        disabled={fase !== "responder" || valorDigitado.length >= digito}
                        onClick={() => digitar("0")}
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl h-12 sm:h-14 text-xl font-bold transition"
                    >
                        0
                    </button>

                    <button
                        disabled={fase !== "responder" || !valorDigitado}
                        onClick={apagar}
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl h-12 sm:h-14 font-bold transition"
                    >
                        ⌫
                    </button>

                </section>

                {/* Confirmar */}
                <button
                    onClick={verificar}
                    disabled={
                        fase !== "responder" ||
                        valorDigitado.length !== digito
                    }
                    className="w-full mt-3 p-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500 font-bold transition"
                >
                    CONFIRMAR RESPOSTA
                </button>

                {/* Progresso */}
                <section className="mt-6 space-y-4">

                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-green-400 font-semibold">
                                Acertos consecutivos
                            </span>
                            <span>{acertosSeguidos}/5</span>
                        </div>

                        <div className="flex gap-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 flex-1 rounded-full ${
                                        i < acertosSeguidos
                                            ? "bg-green-400"
                                            : "bg-slate-700"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-red-400 font-semibold">
                                Erros consecutivos
                            </span>
                            <span>{errosSeguidos}/5</span>
                        </div>

                        <div className="flex gap-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 flex-1 rounded-full ${
                                        i < errosSeguidos
                                            ? "bg-red-400"
                                            : "bg-slate-700"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                </section>

                {/* Histórico */}
                <section className="mt-6 border-t border-slate-700 pt-4">

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm">
                            Histórico recente
                        </h3>

                        <span className="text-xs text-slate-400">
                            {numTentativas} respostas
                        </span>
                    </div>

                    {tentativas.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-3">
                            Nenhuma tentativa ainda.
                        </p>
                    ) : (
                        <div className="space-y-2">

                            {tentativas.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-slate-800 rounded-lg p-2 text-xs"
                                >
                                    <span className="text-slate-400">
                                        Tentativa {numTentativas - index}
                                    </span>

                                    <span className={
                                        item.correto
                                            ? "text-green-400 font-bold"
                                            : "text-red-400 font-bold"
                                    }>
                                        {item.correto ? "✓ Correto" : "✕ Incorreto"}
                                    </span>
                                </div>
                            ))}

                        </div>
                    )}

                </section>

                {/* Reiniciar */}
                <button
                    onClick={reiniciar}
                    className="w-full mt-5 p-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition text-sm font-semibold"
                >
                    ↻ Reiniciar partida
                </button>

                <footer className="text-center mt-5 text-xs text-slate-600">
                    MEMORY CHALLENGE · Treine sua memória
                </footer>

            </div>
        </main>
    );
}
