// ========== COMPONENTE: ORÇAMENTO PDF ==========
// Este componente é RESPONSÁVEL APENAS PELA APRESENTAÇÃO VISUAL
// Recebe dados via props e renderiza o template do orçamento
// 
// Vantagem: Alterações de estilo, layout, espaçamento e fontes ficam TODAS aqui
// Fácil manutenção e modificação do visual do PDF
//
// Importado em App.jsx

import React from "react";
import { Phone, MapPin } from "lucide-react";
import logo from "../assets/logo.jpeg";

// Cores da marca (constantes)
const GOLD = "#D6A821";
const GOLD_DARK = "#B8890F";
const INK = "#111111";

/**
 * Componente OrcamentoPDF
 * 
 * Recebe props:
 *   - cliente: { nome, telefone, endereco, veiculo, ano, placa, km, data }
 *   - rows: [ { id, qtd, desc, tipo, valor, ... } ]
 *   - totals: { maoDeObra, pecas, desconto, total }
 *   - oficina: { nome, subnome, slogan, endereco, whatsapp }
 *   - desconto: número (desconto aplicado)
 *   - observacoes: string
 *   - pagamento: string
 *   - validade: string
 *   - fmt: função que formata valores em reais
 * 
 * Renderiza: A estrutura visual COMPLETA do orçamento (header, dados, tabela, resumo, footer)
 * Não tem lógica, só apresentação
 */
export default function OrcamentoPDF({
  cliente,
  rows,
  totals,
  oficina,
  desconto,
  observacoes,
  pagamento,
  validade,
  fmt,
}) {
  // Formata a data do campo HTML date (YYYY-MM-DD) para DD/MM/YYYY
  const formatDate = (value) => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length !== 3) return value;

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      className="print-area"
      style={{
        maxWidth: 980,
        margin: "24px auto",
        background: "white",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* ========== CABEÇALHO - IDENTIDADE DA MARCA ========== */}
      {/* Fundo preto com nome e informações da oficina */}
      <div
        style={{
          background: INK,
          padding: "22px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* LADO ESQUERDO: Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 72,
          }}
        >
          <img
            src={logo}
            alt={`${oficina.nome} ${oficina.subnome}`}
            style={{
              display: "block",
              width: 200,
              height: "auto",
              maxHeight: 120,
              objectFit: "contain",
            }}
          />
        </div>

        {/* LADO DIREITO: Título "ORÇAMENTO" e contatos */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: GOLD,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            ORÇAMENTO
          </div>
          <div
            style={{
              color: "#cfcfcf",
              fontSize: 11,
              marginTop: 4,
              display: "flex",
              gap: 6,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <MapPin size={12} /> {oficina.endereco}
          </div>
          <div
            style={{
              color: "#cfcfcf",
              fontSize: 11,
              marginTop: 2,
              display: "flex",
              gap: 6,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Phone size={12} /> {oficina.whatsapp}
          </div>
        </div>
      </div>

      {/* ========== CONTEÚDO PRINCIPAL ========== */}
      <div style={{ padding: "24px 32px" }}>

        {/* ========== SEÇÃO: DADOS DO CLIENTE E VEÍCULO ========== */}
        <SectionTitle>Dados do Cliente e Veículo</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: "10px 32px",
            marginBottom: 22,
          }}
        >
          <StaticField label="Cliente" value={cliente.nome} />
          <StaticField label="Veículo / Modelo" value={cliente.veiculo} />
          <StaticField label="Telefone" value={cliente.telefone} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <StaticField label="Ano" value={cliente.ano} />
            <StaticField label="Placa" value={cliente.placa} />
            <StaticField label="KM" value={cliente.km} />
          </div>
          <StaticField label="Endereço" value={cliente.endereco} />
          <StaticField label="Data" value={formatDate(cliente.data)} />
        </div>

        {/* ========== SEÇÃO: TABELA DE ORÇAMENTO ========== */}
        <SectionTitle>Descrição do Orçamento</SectionTitle>
        <div
          style={{
            border: "1px solid #e5e2d8",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            {/* CABEÇALHO DA TABELA */}
            <thead>
              <tr style={{ background: GOLD, color: INK }}>
                <th style={th}>Qtd.</th>
                <th style={{ ...th, textAlign: "left" }}>Serviço / Peça</th>
                <th style={th}>Tipo</th>
                <th style={th}>Valor unit. (R$)</th>
                <th style={th}>Subtotal</th>
              </tr>
            </thead>

            {/* CORPO DA TABELA */}
            <tbody>
              {/* Se não tem linhas, mostra mensagem */}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 18,
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    Nenhum serviço adicionado ao orçamento.
                  </td>
                </tr>
              )}

              {/* Renderiza cada linha da tabela */}
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                  {/* COLUNA: QUANTIDADE */}
                  <td style={td}>
                    <div style={{ textAlign: "center", fontWeight: 500 }}>
                      {Number(r.qtd) || 0}
                    </div>
                  </td>

                  {/* COLUNA: DESCRIÇÃO */}
                  <td style={{ ...td, textAlign: "left" }}>
                    <div style={{ fontSize: 13, color: "#222" }}>
                      {r.desc}
                    </div>
                  </td>

                  {/* COLUNA: TIPO (Mão de obra ou Peça) */}
                  <td style={td}>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {r.tipo === "mao_de_obra" ? "Mão de obra" : "Peça"}
                    </div>
                  </td>

                  {/* COLUNA: VALOR UNITÁRIO */}
                  <td style={td}>
                    <div style={{ textAlign: "right" }}>
                      R$ {fmt(Number(r.valor) || 0)}
                    </div>
                  </td>

                  {/* COLUNA: SUBTOTAL (calculado: qtd × valor) */}
                  <td style={{ ...td, fontWeight: 700 }}>
                    <div style={{ textAlign: "right" }}>
                      R$ {fmt((Number(r.valor) || 0) * (Number(r.qtd) || 0))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========== SEÇÃO: RESUMO + OBSERVAÇÕES ========== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginTop: 8,
          }}
        >
          {/* LADO ESQUERDO: Observações e forma de pagamento */}
          <div>
            <SectionTitle>Observações</SectionTitle>
            <div
              style={{
                border: "1px solid #e5e2d8",
                borderRadius: 8,
                padding: 10,
                minHeight: 80,
                fontSize: 13,
                color: "#333",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {observacoes || "(nenhuma observação)"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>
                  Forma de pagamento
                </div>
                <div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>
                  {pagamento || "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>
                  Validade do orçamento
                </div>
                <div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>
                  {validade || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: Resumo com Totais */}
          <div>
            <SectionTitle>Resumo do Orçamento</SectionTitle>
            <div
              style={{
                border: `1px solid ${GOLD}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              {/* LINHA: Mão de Obra */}
              <ResumoLinha
                label="Mão de obra"
                value={totals.maoDeObra}
                fmt={fmt}
              />

              {/* LINHA: Peças */}
              <ResumoLinha label="Peças" value={totals.pecas} fmt={fmt} />

              {/* LINHA: Desconto */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  fontSize: 13,
                  color: "#444",
                }}
              >
                <span>Desconto</span>
                <span>R$ {fmt(totals.desconto)}</span>
              </div>

              {/* SEPARADOR */}
              <div
                style={{
                  height: 1,
                  background: "#eee",
                  margin: "10px 0",
                }}
              />

              {/* LINHA: TOTAL (em destaque) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 16,
                    color: INK,
                  }}
                >
                  TOTAL
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 22,
                    color: GOLD_DARK,
                  }}
                >
                  R$ {fmt(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== FAIXA DE RODAPÉ ========== */}
        <div
          style={{
            marginTop: 28,
            background: INK,
            borderRadius: 8,
            padding: "12px 20px",
            textAlign: "center",
            color: GOLD,
            fontSize: 12,
            letterSpacing: 1,
            fontWeight: 700,
          }}
        >
          PEÇAS DE QUALIDADE • MÃO DE OBRA ESPECIALIZADA • ATENDIMENTO COM
          CONFIANÇA
        </div>
      </div>
    </div>
  );
}

// ========== SUBCOMPONENTES DE APRESENTAÇÃO ==========

/**
 * Renderiza um título de seção com barra dourada à esquerda
 * Uso: <SectionTitle>Dados do Cliente</SectionTitle>
 */
function SectionTitle({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 4,
          height: 16,
          background: GOLD,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          fontWeight: 800,
          fontSize: 14,
          color: INK,
          letterSpacing: 0.3,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Renderiza um campo estático (apenas leitura) com label
 * Usado na seção de dados do cliente
 * Uso: <StaticField label="Nome" value="João Silva" />
 */
function StaticField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#333",
          fontWeight: 500,
          borderBottom: "1px solid #ccc",
          paddingBottom: 4,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

/**
 * Renderiza uma linha do resumo do orçamento
 * Mostra label e valor formatado em reais
 * Uso: <ResumoLinha label="Mão de obra" value={250} fmt={fmt} />
 * Resultado: "Mão de obra  R$ 250,00"
 */
function ResumoLinha({ label, value, fmt }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontSize: 13,
        color: "#444",
      }}
    >
      <span>{label}</span>
      <span>R$ {fmt(value)}</span>
    </div>
  );
}

// ========== ESTILOS REUTILIZÁVEIS ==========
// Constantes de CSS para células da tabela

const th = {
  padding: "10px 8px",
  fontSize: 12,
  fontWeight: 800,
  textAlign: "center",
};

const td = {
  padding: "8px",
  textAlign: "center",
  verticalAlign: "middle",
};