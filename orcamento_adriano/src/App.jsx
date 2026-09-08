import React, { useState, useMemo, useRef, useCallback } from "react";
// useCallback: Hook que memoiza funções para evitar re-renders desnecessários
// useState: Hook para gerenciar estado (cliente, rows, etc)
// useMemo: Hook para cálculos que só são refeitos quando dependências mudam

import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

// ========== IMPORTS ==========
// Importa dados de categorias (dados estáticos)
import { CATEGORIES } from "./data/categories";

// Importa componente de apresentação visual do PDF
import OrcamentoPDF from "./components/OrcamentoPDF";

// ========== CONSTANTES ==========
// Cores da marca
const GOLD = "#D6A821";
const GOLD_DARK = "#B8890F";
const INK = "#111111";

// Gerador de IDs únicos para as linhas da tabela
let rowIdCounter = 1;
const nextRowId = () => rowIdCounter++;

// ========== COMPONENTE PRINCIPAL ==========
/**
 * App.jsx
 * 
 * Responsabilidades:
 * - Gerenciar estado da aplicação (cliente, rows, checked, etc)
 * - Controlar checklist (marcar/desmarcar itens)
 * - Controlar tabela de orçamento (adicionar/editar/remover linhas)
 * - Calcular totais automaticamente
 * - Renderizar o formulário interativo
 * - Passar dados para OrcamentoPDF (apresentação visual - oculta na tela)
 * 
 * Separação de responsabilidades:
 * - App.jsx: LÓGICA + FORMULÁRIO + OrcamentoPDF (hidden na tela, visível no PDF)
 * - OrcamentoPDF.jsx: APRESENTAÇÃO VISUAL
 * - categories.js: DADOS
 */
export default function App() {
  // ============ ESTADO: DADOS IMUTÁVEIS (da oficina) ============
  // Estes dados nunca mudam durante a aplicação
  const [oficina] = useState({
    nome: "ADRIANO",
    subnome: "CENTRO AUTOMOTIVO",
    slogan: "SEGURANÇA • QUALIDADE • RESPEITO",
    endereco: "Avenida Anita Garibaldi, Nº 591 — Jardim Amanda 2, Hortolândia/SP",
    whatsapp: "(19) 99750-3041",
  });

  // ============ ESTADO: DADOS DO CLIENTE E VEÍCULO ============
  // Formulário com informações do cliente
  const [cliente, setCliente] = useState({
    nome: "",           // Nome do cliente
    telefone: "",       // Telefone do cliente
    endereco: "",       // Endereço do cliente
    veiculo: "",        // Modelo/tipo do veículo
    ano: "",            // Ano do veículo
    placa: "",          // Placa do veículo
    km: "",             // Quilometragem
    data: "",           // Data do orçamento
  });

  // ============ ESTADO: CHECKLIST ============
  // Armazena QUAIS itens estão marcados no checklist
  // Estrutura: { "mecanica::Troca de óleo": true, "freios::Pneus": true, ... }
  const [checked, setChecked] = useState({});

  // ============ ESTADO: CATEGORIAS ABERTAS/FECHADAS ============
  // Controla quais categorias estão expandidas no checklist
  // Inicia com TODAS abertas (true)
  const [openCats, setOpenCats] = useState(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, true]))
  );

  // ============ ESTADO: TABELA DE ORÇAMENTO ============
  // Linhas da tabela (cada serviço/peça adicionado)
  // Cada linha: { id, qtd, desc, tipo, valor, key }
  const [rows, setRows] = useState([]);

  // ============ ESTADO: DESCONTO ============
  // Desconto aplicado ao total do orçamento (em reais)
  const [desconto, setDesconto] = useState(0);

  // ============ ESTADO: CAMPOS ADICIONAIS ============
  // Campos extra do orçamento
  const [observacoes, setObservacoes] = useState("");  // Anotações adicionais
  const [pagamento, setPagamento] = useState("");      // Forma de pagamento
  const [validade, setValidade] = useState("");        // Data de validade

  // ============ REF: Para impressão ============
  // Referência para o elemento que será impresso
  const printRef = useRef(null);

  // ========== FUNÇÕES - GERENCIAMENTO DE CATEGORIAS ==========

  /**
   * Alterna (toggle) se uma categoria está aberta ou fechada
   * Recebe: id da categoria (ex: "mecanica", "freios")
   * Resultado: inverte o estado de openCats[id]
   */
  const toggleCat = (id) =>
    setOpenCats((s) => ({ ...s, [id]: !s[id] }));

  // ========== FUNÇÕES - CHECKLIST COM PREVENÇÃO DE DUPLICAÇÃO ==========

  /**
   * ⭐ FUNÇÃO CRÍTICA - Marcar/Desmarcar item do checklist
   * 
   * O que ela faz:
   * 1. Se o item já está marcado → DESMARCAR (remove linha, unchecks)
   * 2. Se o item não está marcado → MARCAR (adiciona linha, checks)
   * 
   * useCallback é essencial porque:
   * - Em desenvolvimento, React chama funções 2x (StrictMode)
   * - Sem useCallback, causaria duplicações
   * - useCallback memoiza a função, evitando chamadas extras
   * 
   * Parâmetros:
   *   - catId: ID da categoria (ex: "mecanica")
   *   - item: objeto do item (ex: { name: "Troca de óleo", labor: 60 })
   */
  const toggleItem = useCallback((catId, item) => {
    // Cria chave única combinando categoria + nome do item
    const key = `${catId}::${item.name}`;

    // Atualiza o estado "checked" (itens marcados)
    setChecked((prev) => {
      const isChecked = !!prev[key];

      if (isChecked) {
        // CASO 1: DESMARCAR o item
        // Remove a linha correspondente da tabela
        setRows((rs) => rs.filter((r) => r.key !== key));

        // Remove do objeto "checked"
        const next = { ...prev };
        delete next[key];
        return next;
      } else {
        // CASO 2: MARCAR o item
        // Adiciona a linha à tabela
        setRows((rs) => {
          // ⭐ PREVENÇÃO DE DUPLICAÇÃO
          // Se a linha já existe, não adiciona de novo
          const itemExists = rs.some((r) => r.key === key);
          if (itemExists) return rs;

          // Cria nova linha com valores padrão
          return [
            ...rs,
            {
              id: nextRowId(),           // ID único
              key,                        // Chave do item (para rastrear)
              qtd: 1,                     // Quantidade padrão
              desc: item.name,            // Descrição do serviço
              tipo: "mao_de_obra",        // Tipo padrão (é mão de obra)
              valor: item.labor,          // Valor pré-definido da planilha
            },
          ];
        });

        // Marca no objeto "checked"
        return { ...prev, [key]: true };
      }
    });
  }, []);
  // [] = dependências vazias: função criada uma vez e reutilizada

  // ========== FUNÇÕES - TABELA DE ORÇAMENTO ==========

  /**
   * Adiciona uma nova linha em branco na tabela
   * Usada quando o usuário quer adicionar serviço que não está no checklist
   */
  const addManualRow = () => {
    setRows((rs) => [
      ...rs,
      {
        id: nextRowId(),
        key: null,        // null porque não vem de checklist
        qtd: 1,
        desc: "",         // Vazio: usuário vai preencher
        tipo: "peca",     // Padrão: peça (não mão de obra)
        valor: 0,
      },
    ]);
  };

  /**
   * Remove uma linha da tabela
   * Se veio de checklist (tem row.key), também desmarca lá
   */
  const removeRow = (row) => {
    // Remove a linha
    setRows((rs) => rs.filter((r) => r.id !== row.id));

    // Se veio de checklist, desmarca lá também
    if (row.key) {
      setChecked((prev) => {
        const next = { ...prev };
        delete next[row.key];
        return next;
      });
    }
  };

  /**
   * Atualiza um campo específico de uma linha
   * 
   * Parâmetros:
   *   - id: ID da linha
   *   - field: qual campo ("qtd", "desc", "tipo", "valor")
   *   - value: novo valor
   */
  const updateRow = (id, field, value) => {
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // ========== CÁLCULO AUTOMÁTICO DE TOTAIS ==========

  /**
   * Calcula os totais automaticamente
   * useMemo: recalcula APENAS quando rows ou desconto mudam
   * 
   * Retorna: { maoDeObra, pecas, desconto, total }
   */
  const totals = useMemo(() => {
    let maoDeObra = 0;  // Soma de mão de obra
    let pecas = 0;      // Soma de peças

    // Percorre cada linha
    rows.forEach((r) => {
      // Subtotal: valor unitário × quantidade
      const val = (Number(r.valor) || 0) * (Number(r.qtd) || 0);

      // Soma ao total correto (mão de obra ou peça)
      if (r.tipo === "mao_de_obra") {
        maoDeObra += val;
      } else {
        pecas += val;
      }
    });

    // Aplica desconto
    const desc = Number(desconto) || 0;

    // Total final (nunca negativo)
    const total = Math.max(0, maoDeObra + pecas - desc);

    return { maoDeObra, pecas, desconto: desc, total };
  }, [rows, desconto]);
  // Dependências: recalcula quando rows ou desconto mudam

  // ========== FUNÇÕES UTILITÁRIAS ==========

  /**
   * Formata um número como moeda brasileira
   * Exemplo: 1200.5 → "1.200,50"
   */
  const fmt = (n) =>
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /**
   * Abre o diálogo de impressão do navegador
   * Usuário escolhe "Salvar como PDF" como destino
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Limpa TODO o orçamento (com confirmação)
   */
  const handleReset = () => {
    if (!window.confirm("Limpar todos os dados do orçamento atual?")) return;

    // Reseta cada state
    setCliente({
      nome: "",
      telefone: "",
      endereco: "",
      veiculo: "",
      ano: "",
      placa: "",
      km: "",
      data: "",
    });
    setChecked({});
    setRows([]);
    setDesconto(0);
    setObservacoes("");
    setPagamento("");
    setValidade("");
  };

  // ========== RENDERIZAÇÃO (JSX) ==========

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#F3F3F1",
        minHeight: "100vh",
      }}
    >
      {/* ========== ESTILOS GLOBAIS ========== */}
      <style>{`
        /* ========== OCULTAR PDF NA TELA NORMAL ========== */
        /* O componente OrcamentoPDF fica escondido enquanto navega o site */
        .print-area {
          display: none;
        }

        /* ========== MOSTRAR NA IMPRESSÃO/PDF ========== */
        /* Quando aperta Ctrl+P ou "Gerar PDF", mostra APENAS o PDF */
        @media print {
          /* Mostra o PDF */
          .print-area {
            display: block !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: avoid;
          }

          /* Esconde tudo que é "não-imprimir" (formulário, checklist, botões) */
          .no-print {
            display: none !important;
          }

          /* Fundo branco na impressão */
          body {
            background: white !important;
          }

          /* Inputs/textareas sem bordas na impressão */
          input, textarea, select {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }
        }

        /* ========== ESTILOS DE CAMPO DE ENTRADA ========== */
        .field-input {
          border: none;
          border-bottom: 1.5px solid #ccc;
          background: transparent;
          padding: 4px 2px;
          font-size: 14px;
          width: 100%;
          outline: none;
          color: #1a1a1a;
        }

        .field-input:focus {
          border-bottom-color: ${GOLD_DARK};
        }

        /* ========== ESTILOS DO CHECKLIST ========== */
        .checklist-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 4px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          line-height: 1.3;
        }

        .checklist-item:hover {
          background: #f2ede0;
        }

        .chk-box {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          border: 2px solid #333;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .chk-box.on {
          background: ${INK};
          border-color: ${INK};
        }
      `}</style>

      {/* ========== COMPONENTE PDF (oculto na tela, visível na impressão) ========== */}
      {/* 
        O OrcamentoPDF fica AQUI renderizado, mas:
        - Tela normal: display: none (está escondido)
        - Na hora de imprimir (Ctrl+P): @media print muda pra display: block
        - Resultado: só o PDF aparece na impressão/PDF
      */}
      <div className="print-area">
        <OrcamentoPDF
          ref={printRef}
          cliente={cliente}
          rows={rows}
          totals={totals}
          oficina={oficina}
          desconto={desconto}
          observacoes={observacoes}
          pagamento={pagamento}
          validade={validade}
          fmt={fmt}
        />
      </div>

      {/* ========== SEÇÃO: FORMULÁRIO INTERATIVO (oculta na impressão) ========== */}
      <div className="no-print">

        {/* ========== SUBSEÇÃO: DADOS DO CLIENTE ========== */}
        <div
          style={{
            maxWidth: 980,
            margin: "24px auto",
            padding: "0 4px",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: INK,
                letterSpacing: 0.3,
              }}
            >
              👤 Dados do Cliente e Veículo
            </span>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 8,
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr",
                gap: "10px 32px",
              }}
            >
              <LabeledInput
                label="Cliente"
                value={cliente.nome}
                onChange={(v) => setCliente({ ...cliente, nome: v })}
              />
              <LabeledInput
                label="Veículo / Modelo"
                value={cliente.veiculo}
                onChange={(v) => setCliente({ ...cliente, veiculo: v })}
              />
              <LabeledInput
                label="Telefone"
                value={cliente.telefone}
                onChange={(v) => setCliente({ ...cliente, telefone: v })}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <LabeledInput
                  label="Ano"
                  value={cliente.ano}
                  onChange={(v) => setCliente({ ...cliente, ano: v })}
                />
                <LabeledInput
                  label="Placa"
                  value={cliente.placa}
                  onChange={(v) =>
                    setCliente({ ...cliente, placa: v.toUpperCase() })
                  }
                />
                <LabeledInput
                  label="KM"
                  value={cliente.km}
                  onChange={(v) => setCliente({ ...cliente, km: v })}
                />
              </div>
              <LabeledInput
                label="Endereço"
                value={cliente.endereco}
                onChange={(v) => setCliente({ ...cliente, endereco: v })}
              />
              <LabeledInput
                label="Data"
                type="date"
                value={cliente.data}
                onChange={(v) => setCliente({ ...cliente, data: v })}
              />
              <LabeledInput
                label="Forma de pagamento"
                value={pagamento}
                onChange={setPagamento}
              />
              <LabeledInput
                label="Validade do orçamento"
                type="date"
                value={validade}
                onChange={setValidade}
              />
            </div>

            {/* Campo de Observações */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
                Observações
              </div>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                placeholder="Anotações adicionais sobre o serviço..."
                style={{
                  width: "100%",
                  border: "1px solid #e5e2d8",
                  borderRadius: 6,
                  padding: 8,
                  fontSize: 13,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        </div>

        {/* ========== SEÇÃO: CHECKLIST ========== */}
        <div
          style={{
            maxWidth: 980,
            margin: "24px auto",
            padding: "0 4px",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: INK,
                letterSpacing: 0.3,
              }}
            >
              📋 Checklist de Serviços
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 18,
              marginBottom: 24,
            }}
          >
            {/* Renderiza cada categoria */}
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const open = openCats[cat.id];

              return (
                <div
                  key={cat.id}
                  style={{
                    border: "1px solid #e5e2d8",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  {/* BOTÃO: Abrir/Fechar Categoria */}
                  <button
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      background: INK,
                      color: "white",
                      border: "none",
                      borderRadius: "7px 7px 0 0",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Icon size={15} color={GOLD} /> {cat.label}
                    </span>
                    {open ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {/* ITENS DA CATEGORIA (visíveis se open === true) */}
                  {open && (
                    <div style={{ padding: "8px 10px" }}>
                      {/* Renderiza cada item da categoria */}
                      {cat.items.map((item) => {
                        const key = `${cat.id}::${item.name}`;
                        const on = !!checked[key]; // Está marcado?

                        return (
                          <div
                            key={key}
                            className="checklist-item"
                            onClick={() => toggleItem(cat.id, item)}
                          >
                            {/* CHECKBOX VISUAL */}
                            <div
                              className={`chk-box${on ? " on" : ""}`}
                            >
                              {on && (
                                <span
                                  style={{
                                    color: "white",
                                    fontSize: 12,
                                    fontWeight: 900,
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>

                            {/* NOME DO SERVIÇO */}
                            <span
                              style={{
                                flex: 1,
                                color: "#222",
                              }}
                            >
                              {item.name}
                            </span>

                            {/* PREÇO PRÉ-DEFINIDO */}
                            <span
                              style={{
                                color: "#999",
                                fontSize: 12,
                              }}
                            >
                              R$ {fmt(item.labor)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== SEÇÃO: TABELA INTERATIVA ========== */}
        <div
          style={{
            maxWidth: 980,
            margin: "24px auto",
            padding: "0 4px",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: INK,
                letterSpacing: 0.3,
              }}
            >
              ✏️ Editar Linhas
            </span>
          </div>

          <div
            style={{
              border: "1px solid #e5e2d8",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 8,
              background: "white",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              {/* CABEÇALHO */}
              <thead>
                <tr style={{ background: GOLD, color: INK }}>
                  <th style={th}>Qtd.</th>
                  <th style={{ ...th, textAlign: "left" }}>
                    Serviço / Peça
                  </th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Valor unit. (R$)</th>
                  <th style={th}>Subtotal</th>
                  <th style={th}></th>
                </tr>
              </thead>

              {/* CORPO */}
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 18,
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      Marque itens no checklist ou adicione uma linha manualmente.
                    </td>
                  </tr>
                )}

                {/* Renderiza cada linha */}
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                    {/* QUANTIDADE */}
                    <td style={td}>
                      <input
                        className="field-input"
                        style={{ textAlign: "center" }}
                        type="number"
                        min={0}
                        value={r.qtd}
                        onChange={(e) =>
                          updateRow(r.id, "qtd", e.target.value)
                        }
                      />
                    </td>

                    {/* DESCRIÇÃO */}
                    <td style={{ ...td, textAlign: "left" }}>
                      <input
                        className="field-input"
                        value={r.desc}
                        placeholder="Descreva o serviço/peça"
                        onChange={(e) =>
                          updateRow(r.id, "desc", e.target.value)
                        }
                      />
                    </td>

                    {/* TIPO */}
                    <td style={td}>
                      <select
                        className="field-input"
                        value={r.tipo}
                        onChange={(e) =>
                          updateRow(r.id, "tipo", e.target.value)
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: 13,
                        }}
                      >
                        <option value="mao_de_obra">Mão de obra</option>
                        <option value="peca">Peça</option>
                      </select>
                    </td>

                    {/* VALOR UNITÁRIO */}
                    <td style={td}>
                      <input
                        className="field-input"
                        style={{ textAlign: "right" }}
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.valor}
                        onChange={(e) =>
                          updateRow(r.id, "valor", e.target.value)
                        }
                      />
                    </td>

                    {/* SUBTOTAL */}
                    <td style={{ ...td, fontWeight: 700 }}>
                      R$ {fmt((Number(r.valor) || 0) * (Number(r.qtd) || 0))}
                    </td>

                    {/* DELETE */}
                    <td style={td}>
                      <button
                        onClick={() => removeRow(r)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#c0392b",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTÃO: Adicionar Linha Manual */}
          <button
            onClick={addManualRow}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: `1.5px dashed ${GOLD_DARK}`,
              color: GOLD_DARK,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 24,
            }}
          >
            <Plus size={14} /> Adicionar linha manual
          </button>
        </div>

        {/* ========== SEÇÃO: DESCONTO ========== */}
        <div
          style={{
            maxWidth: 980,
            margin: "24px auto",
            padding: "0 4px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 8,
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
                Desconto (R$)
              </div>
              <input
                type="number"
                min={0}
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                className="field-input"
                style={{ width: "100%", maxWidth: 200 }}
              />
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              Desconto: R$ {fmt(Number(desconto) || 0)}
            </div>
          </div>
        </div>

        {/* ========== SEÇÃO: RESUMO ========== */}
        <div
          style={{
            maxWidth: 980,
            margin: "24px auto",
            padding: "0 4px",
            marginBottom: 40,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: INK,
                letterSpacing: 0.3,
              }}
            >
              💰 Resumo do Orçamento
            </span>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 8,
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: `2px solid ${GOLD}`,
            }}
          >
            {/* GRID COM 2 COLUNAS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
              }}
            >
              {/* COLUNA ESQUERDA: Breakdown */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    fontSize: 14,
                    borderBottom: "1px solid #e5e2d8",
                  }}
                >
                  <span style={{ color: "#666" }}>Mão de Obra</span>
                  <span style={{ fontWeight: 600, color: INK }}>
                    R$ {fmt(totals.maoDeObra)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    fontSize: 14,
                    borderBottom: "1px solid #e5e2d8",
                  }}
                >
                  <span style={{ color: "#666" }}>Peças</span>
                  <span style={{ fontWeight: 600, color: INK }}>
                    R$ {fmt(totals.pecas)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    fontSize: 14,
                    color: "#c0392b",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Desconto</span>
                  <span style={{ fontWeight: 600 }}>
                    - R$ {fmt(totals.desconto)}
                  </span>
                </div>
              </div>

              {/* COLUNA DIREITA: TOTAL DESTAQUE */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  paddingLeft: 20,
                  borderLeft: `2px solid ${GOLD}`,
                }}
              >
                <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
                  TOTAL DO ORÇAMENTO
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    color: GOLD_DARK,
                    lineHeight: 1,
                  }}
                >
                  R$ {fmt(totals.total)}
                </div>
              </div>
            </div>

            {/* INFORMAÇÕES EXTRAS */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid #e5e2d8",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
                fontSize: 12,
              }}
            >
              <div>
                <div style={{ color: "#999", marginBottom: 4 }}>
                  Quantidade de Itens
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: INK }}>
                  {rows.length}
                </div>
              </div>

              <div>
                <div style={{ color: "#999", marginBottom: 4 }}>
                  Itens de Mão de Obra
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: INK }}>
                  {rows.filter((r) => r.tipo === "mao_de_obra").length}
                </div>
              </div>

              <div>
                <div style={{ color: "#999", marginBottom: 4 }}>
                  Itens de Peça
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: INK }}>
                  {rows.filter((r) => r.tipo === "peca").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== SEÇÃO: BOTÕES DE AÇÃO ========== */}
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto 40px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            padding: "0 4px",
          }}
        >
          {/* BOTÃO: LIMPAR */}
          <button
            onClick={handleReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "white",
              border: "1px solid #ccc",
              color: "#444",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} /> Limpar
          </button>

          {/* BOTÃO: GERAR PDF */}
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: INK,
              border: "none",
              color: GOLD,
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Printer size={15} /> Gerar PDF / Imprimir
          </button>
        </div>

      </div>
    </div>
  );
}

// ========== SUBCOMPONENTES REUTILIZÁVEIS ==========

/**
 * Campo de entrada com label
 * Usado nos formulários
 */
function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
        {label}
      </div>
      <input
        className="field-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ========== ESTILOS REUTILIZÁVEIS ==========
// Constantes de CSS para a tabela interativa

const th = { padding: "10px 8px", fontSize: 12, fontWeight: 800, textAlign: "center" };
const td = { padding: "8px", textAlign: "center", verticalAlign: "middle" };