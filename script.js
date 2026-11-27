// =====================================================================
// Ficha de Herói - Aldrya Haldren (Parte 2)
// =====================================================================

// ---------- Dados do inventário (array de objetos) ----------
const inventario = [
  { nome: "Haldra", tipo: "Arma", raridade: "Lendário", imagem: "imagens/machado-RPG.jfif",
    descricao: "O antigo machado da família Haldren. É a principal arma de Aldrya e o símbolo do legado de sua família." },
  { nome: "Adaga de Viagem", tipo: "Arma", raridade: "Comum", imagem: "imagens/adaga-RPG.jpeg",
    descricao: "Uma adaga simples com bainha de couro, usada quando o machado é grande demais para a ocasião." },
  { nome: "Capa do Pai", tipo: "Relíquia", raridade: "Raro", imagem: "imagens/capa-RPG.jfif",
    descricao: "A antiga capa de seu pai. Aldrya a mantém consigo desde a destruição de Eirnholm." },
  { nome: "Medalhão da Mãe", tipo: "Relíquia", raridade: "Épico", imagem: "imagens/broche-RPG.jpg",
    descricao: "Um pequeno medalhão que pertenceu à sua mãe. É uma das poucas lembranças físicas que Aldrya ainda possui de sua família." },
  { nome: "Bolsa de Aventureira", tipo: "Equipamento", raridade: "Comum", imagem: "imagens/bolsa-RPG.jfif",
    descricao: "Inclui corda, pederneira, cantil, comida, algumas bandagens e ferramentas básicas." },
  { nome: "Kit de Cura", tipo: "Poção", raridade: "Incomum", imagem: "imagens/kit-RPG.jpg",
    descricao: "Frascos, ervas, unguento e bandagens para tratar ferimentos durante a jornada." }
];

const XP_POR_MISSAO = 25;
const XP_PARA_SUBIR = 100;
const VALOR_MAXIMO_ATRIBUTO = 10;
const atributosIniciais = { forca: 9, destreza: 7, constituicao: 9, inteligencia: 5, sabedoria: 6, carisma: 8 };

// ---------- Salvamento no navegador (localStorage) ----------
// Pesquisa complementar: os dados continuam depois de recarregar a página.
function carregar(chave, padrao) {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo === null ? padrao : JSON.parse(salvo);
  } catch (erro) {
    return padrao; // armazenamento bloqueado ou dado inválido
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    // A ficha continua funcionando, apenas sem salvar
  }
}

// ---------- Saudação conforme o horário ----------
function mostrarSaudacao() {
  const hora = new Date().getHours();
  let texto = "Boa noite, guerreiro(a)!";

  if (hora >= 5 && hora < 12) {
    texto = "Bom dia, viajante!";
  } else if (hora >= 12 && hora < 18) {
    texto = "Boa tarde, aventureiro(a)!";
  }

  document.getElementById("saudacao").textContent = texto;
}

// ---------- Menu hambúrguer e scroll suave ----------
const botaoMenu = document.getElementById("botao-menu");
const menu = document.getElementById("menu");

function definirMenu(aberto) {
  menu.classList.toggle("aberto", aberto);
  botaoMenu.textContent = aberto ? "✕" : "☰";
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
}

botaoMenu.addEventListener("click", () => definirMenu(!menu.classList.contains("aberto")));

// A tecla Esc também fecha o menu
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") definirMenu(false);
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (evento) => {
    evento.preventDefault();
    definirMenu(false); // fecha antes de rolar, para a posição ficar certa
    document.querySelector(link.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
  });
});

// ---------- Modo noturno ----------
const botaoTema = document.getElementById("botao-tema");

function aplicarTema(noturno) {
  document.body.classList.toggle("modo-noturno", noturno);
  botaoTema.textContent = noturno ? "🔥 Modo taverna" : "🌙 Modo noturno";
  botaoTema.setAttribute("aria-pressed", noturno);
}

botaoTema.addEventListener("click", () => {
  const noturno = !document.body.classList.contains("modo-noturno");
  aplicarTema(noturno);
  salvar("modoNoturno", noturno);
});

// ---------- Ver mais / Ver menos ----------
const botaoHistoria = document.getElementById("botao-historia");

botaoHistoria.addEventListener("click", () => {
  const revelado = document.getElementById("historia-completa").classList.toggle("revelado");
  botaoHistoria.textContent = revelado ? "Ver menos" : "Ver história completa";
  botaoHistoria.setAttribute("aria-expanded", revelado);
});

// ---------- Experiência, nível e atributos ----------
const heroiInicial = { nivel: 1, xp: 0, atributos: atributosIniciais };
let heroi = carregar("heroi", structuredClone(heroiInicial));

function atualizarPainel() {
  document.getElementById("nivel").textContent = heroi.nivel;
  document.getElementById("xp-atual").textContent = heroi.xp;
  document.getElementById("barra-xp").value = heroi.xp;

  document.querySelectorAll("[data-atributo]").forEach((card) => {
    const valor = heroi.atributos[card.dataset.atributo];
    card.querySelector(".stat-value").textContent = `${valor}/${VALOR_MAXIMO_ATRIBUTO}`;
    card.querySelector("progress").value = valor;
  });
}

// Ao subir de nível, o primeiro atributo com o menor valor ganha +1
function evoluirAtributo() {
  const chaves = Object.keys(heroi.atributos);
  let menor = chaves[0];

  chaves.forEach((chave) => {
    if (heroi.atributos[chave] < heroi.atributos[menor]) menor = chave;
  });

  if (heroi.atributos[menor] >= VALOR_MAXIMO_ATRIBUTO) {
    return "Todos os atributos já estão no máximo.";
  }

  heroi.atributos[menor]++;
  const nome = document.querySelector(`[data-atributo="${menor}"] .stat-name`).textContent;
  return `${nome} +1.`;
}

function mostrarMensagem(id, texto, classe) {
  const elemento = document.getElementById(id);
  elemento.textContent = texto;
  elemento.className = `mensagem ${classe}`;
}

document.getElementById("botao-xp").addEventListener("click", () => {
  heroi.xp += XP_POR_MISSAO;

  if (heroi.xp >= XP_PARA_SUBIR) {
    heroi.xp -= XP_PARA_SUBIR;
    heroi.nivel++;
    mostrarMensagem("mensagem-xp", `🎉 Nível up! Aldrya chegou ao nível ${heroi.nivel}. ${evoluirAtributo()}`, "nivel-up");
  } else {
    mostrarMensagem("mensagem-xp", `Missão concluída! +${XP_POR_MISSAO} XP. Faltam ${XP_PARA_SUBIR - heroi.xp} XP.`, "sucesso");
  }

  atualizarPainel();
  salvar("heroi", heroi);
});

document.getElementById("botao-reiniciar").addEventListener("click", () => {
  // Confirmação para evitar perder o progresso sem querer
  if (!confirm("Deseja mesmo voltar ao nível 1?")) return;

  heroi = structuredClone(heroiInicial);
  atualizarPainel();
  salvar("heroi", heroi);
  mostrarMensagem("mensagem-xp", "Progresso reiniciado.", "sucesso");
});

// ---------- Inventário dinâmico, filtros e favoritos ----------
let favoritos = carregar("favoritos", []);
const filtro = { tipo: "Todos", raridade: "Todas" };

// Transforma "Épico" em "epico" para usar como classe CSS
function paraClasse(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function atualizarContador() {
  document.getElementById("contador-itens").textContent =
    `🏆 ${inventario.length} itens conquistados · ★ ${favoritos.length} favorito(s)`;
}

function criarCard(item) {
  const card = document.createElement("article");
  card.className = "card-item";

  // innerHTML controlado: os dados vêm apenas do array acima
  card.innerHTML = `
    <img src="${item.imagem}" alt="${item.nome}">
    <h3>${item.nome}</h3>
    <span class="selo selo-${paraClasse(item.raridade)}">${item.raridade} · ${item.tipo}</span>
    <p>${item.descricao}</p>
  `;

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao-favorito";

  function atualizarBotao() {
    const favorito = favoritos.includes(item.nome);
    botao.textContent = favorito ? "★ Favoritado" : "☆ Favoritar";
    botao.classList.toggle("ativo", favorito);
    botao.setAttribute("aria-pressed", favorito);
  }

  botao.addEventListener("click", () => {
    favoritos = favoritos.includes(item.nome)
      ? favoritos.filter((nome) => nome !== item.nome)
      : [...favoritos, item.nome];

    salvar("favoritos", favoritos);
    atualizarBotao();
    atualizarContador();
  });

  atualizarBotao();
  card.appendChild(botao);
  return card;
}

function mostrarItens() {
  const lista = document.getElementById("lista-itens");
  lista.innerHTML = "";

  const filtrados = inventario.filter((item) =>
    (filtro.tipo === "Todos" || item.tipo === filtro.tipo) &&
    (filtro.raridade === "Todas" || item.raridade === filtro.raridade)
  );

  filtrados.forEach((item) => lista.appendChild(criarCard(item)));

  document.getElementById("aviso-inventario").textContent = filtrados.length === 0
    ? "Nenhum item com essa combinação. Escolha “Todos” ou “Todas” para limpar o filtro."
    : `Mostrando ${filtrados.length} de ${inventario.length} itens.`;
}

function criarFiltros(idGrupo, propriedade, opcaoGeral) {
  const grupo = document.getElementById(idGrupo);
  // Set remove os valores repetidos
  const opcoes = [opcaoGeral, ...new Set(inventario.map((item) => item[propriedade]))];

  opcoes.forEach((opcao) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-filtro";
    botao.textContent = opcao;
    botao.classList.toggle("ativo", opcao === opcaoGeral);
    botao.setAttribute("aria-pressed", opcao === opcaoGeral);

    botao.addEventListener("click", () => {
      filtro[propriedade] = opcao;

      grupo.querySelectorAll("button").forEach((outro) => {
        outro.classList.toggle("ativo", outro === botao);
        outro.setAttribute("aria-pressed", outro === botao);
      });

      mostrarItens();
    });

    grupo.appendChild(botao);
  });
}

// ---------- Formulário da guilda ----------
const formulario = document.getElementById("form-guilda");
const campos = ["nome", "email", "msg"].map((id) => document.getElementById(id));
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mostra o erro abaixo do campo e devolve true se ele estiver correto
function validarCampo(campo) {
  const valor = campo.value.trim();
  let erro = "";

  if (valor === "") {
    erro = "Este campo é obrigatório.";
  } else if (campo.id === "email" && !formatoEmail.test(valor)) {
    erro = "Digite um e-mail válido, como voce@exemplo.com.";
  }

  document.getElementById(`erro-${campo.id}`).textContent = erro;
  campo.classList.toggle("invalido", erro !== "");
  campo.classList.toggle("valido", erro === "");
  campo.setAttribute("aria-invalid", erro !== "");
  return erro === "";
}

campos.forEach((campo) => {
  // Avisa ao sair do campo e corrige o aviso enquanto a pessoa digita
  campo.addEventListener("blur", () => validarCampo(campo));
  campo.addEventListener("input", () => {
    mostrarMensagem("status-form", "", "");
    if (campo.classList.contains("invalido")) validarCampo(campo);
  });
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  // map valida todos os campos, para mostrar todos os erros de uma vez
  const resultados = campos.map(validarCampo);

  if (resultados.includes(false)) {
    mostrarMensagem("status-form", "Não foi possível enviar. Corrija os campos destacados.", "erro-geral");
    campos[resultados.indexOf(false)].focus();
    return;
  }

  const nome = document.getElementById("nome").value.trim();
  mostrarMensagem("status-form", `Mensagem enviada com sucesso, ${nome}! (envio simulado)`, "sucesso");
  formulario.reset();
  campos.forEach((campo) => {
    campo.classList.remove("valido", "invalido");
    campo.removeAttribute("aria-invalid");
  });
});

// ---------- Início ----------
mostrarSaudacao();
aplicarTema(carregar("modoNoturno", false));
atualizarPainel();
criarFiltros("filtros-tipo", "tipo", "Todos");
criarFiltros("filtros-raridade", "raridade", "Todas");
mostrarItens();
atualizarContador();
