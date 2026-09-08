// ========== DATA - CATEGORIAS E SERVIÇOS ==========
// Este arquivo contém APENAS os dados estáticos
// Todas as categorias com seus serviços e preços de mão de obra
// Importado em App.jsx

import { Wrench, Zap, Disc, Car } from "lucide-react";

// Array com todas as 4 categorias de serviços
// Cada categoria tem: id, label (nome), icon (ícone), items (serviços)
// Cada serviço tem: name (descrição), labor (preço em R$)

export const CATEGORIES = [
  {
    id: "mecanica",
    label: "Mecânica Geral",
    icon: Wrench,
    items: [
      { name: "Troca correia dentada", labor: 350 },
      { name: "Correia auxiliar", labor: 120 },
      { name: "Troca de vela", labor: 60 },
      { name: "Troca de bobina", labor: 40 },
      { name: "Limpeza de bico", labor: 120 },
      { name: "Bomba de combustível/Sensor", labor: 150 },
      { name: "Bomba descendo tanque", labor: 400 },
      { name: "Troca reservatório de água", labor: 80 },
      { name: "Limpeza sistema arrefecimento", labor: 250 },
      { name: "Troca radiador", labor: 150 },
      { name: "Bomba d'água", labor: 200 },
    ],
  },
  {
    id: "injecao",
    label: "Injeção, Embreagem e Suspensão",
    icon: Zap,
    items: [
      { name: "Embreagem", labor: 450 },
      { name: "Troca amortecedor dianteiro", labor: 240 },
      { name: "Troca amortecedor traseiro", labor: 200 },
      { name: "Troca Kit amortecedor", labor: 200 },
      { name: "Troca mola dianteira/traseira", labor: 160 },
      { name: "Troca mola traseira", labor: 100 },
      { name: "Bucha eixo traseiro", labor: 350 },
      { name: "Troca coxim câmbio", labor: 180 },
      { name: "Troca coxim motor", labor: 180 },
      { name: "Troca de bandeja", labor: 120 },
    ],
  },
  {
    id: "freios",
    label: "Direção, Freios e Rodas",
    icon: Disc,
    items: [
      { name: "Troca pastilha de freio", labor: 100 },
      { name: "Troca disco e pastilha", labor: 120 },
      { name: "Lona freio", labor: 150 },
      { name: "Troca fluido de freio", labor: 280 },
      { name: "Troca cilindro mestre", labor: 180 },
      { name: "Troca caixa de direção Mecânica", labor: 250 },
      { name: "Troca caixa de direção Hidráulica", labor: 450 },
      { name: "Troca pivô/terminal", labor: 100 },
      { name: "Alinhamento", labor: 80 },
      { name: "Balanceamento", labor: 25 },
      { name: "Cambagem", labor: 120 },
      { name: "Rodízio pneu", labor: 40 },
      { name: "Conserto Pneu Macarrão", labor: 25 },
      { name: "Conserto Pneu Interno", labor: 40 },
      { name: "Troca de pneu", labor: 15 },
    ],
  },
  {
    id: "transmissao",
    label: "Transmissão e Elétrica",
    icon: Car,
    items: [
      { name: "Troca homorcinética", labor: 150 },
      { name: "Bieletas", labor: 80 },
      { name: "Rolamento dianteiro", labor: 150 },
      { name: "Rolamento Traseiro", labor: 100 },
      { name: "Troca trizeta", labor: 120 },
      { name: "Troca trobulador", labor: 160 },
      { name: "Cabo de transmissão", labor: 600 },
      { name: "Alternador", labor: 250 },
      { name: "Motor partida", labor: 250 },
      { name: "Diagnóstico scanner", labor: 80 },
    ],
  },
];