// --- VARIÁVEIS GLOBAIS ---
let servidorSelecionado = null;
// Coloque a sua URL real do Render aqui para facilitar
const URL_BASE_BOT = "https://celestial-bot-zj6o.onrender.com";

// --- FUNÇÕES DE NAVEGAÇÃO E TROCA DE TELA ---

function mostrarPainel() {
    document.getElementById('site-principal').classList.add('hidden');
    document.getElementById('site-principal').classList.remove('flex');
    
    const painel = document.getElementById('painel-loritta');
    painel.classList.remove('hidden');
    painel.classList.add('flex');
    
    voltarAoInicioBot();
    window.scrollTo(0, 0);
}

function voltarAoInicio() {
    document.getElementById('painel-loritta').classList.add('hidden');
    document.getElementById('painel-loritta').classList.remove('flex');
    
    const site = document.getElementById('site-principal');
    site.classList.remove('hidden');
    site.classList.add('flex');
    window.scrollTo(0, 0);
}

// ATUALIZADO: Agora esta função verifica se o bot está no servidor
async function abrirListaServidores() {
    document.getElementById('bot-landing').classList.add('hidden');
    document.getElementById('config-limpeza').classList.add('hidden');
    document.getElementById('lista-servidores').classList.remove('hidden');

    try {
        // 1. Pergunta ao seu bot no Render quais servidores ele conhece
        const response = await fetch(`${URL_BASE_BOT}/api/bot-servidores`);
        const servidoresAtivosNoBanco = await response.json(); // Lista de IDs: ["123", "456"]

        // 2. Localiza os cards de servidores que você já tem no HTML
        const cards = document.querySelectorAll('.server-card');

        cards.forEach(card => {
            // Pegamos o ID que está guardado no card (ex: data-id="123456789")
            const servidorId = card.getAttribute('data-id'); 
            const botao = card.querySelector('button');

            if (servidorId && botao) {
                // 3. Compara: O bot está nesse ID?
                const botPresente = servidoresAtivosNoBanco.includes(servidorId);

                if (botPresente) {
                    // Bot está presente -> Botão Azul de Configurar
                    botao.innerText = "Configurar";
                    botao.className = "btn-config bg-blue-600 w-full py-2 rounded font-bold";
                    botao.onclick = () => abrirConfigLimpeza(card.querySelector('h4').innerText);
                } else {
                    // Bot NÃO está -> Botão Rosa de Convidar
                    botao.innerText = "Convidar";
                    botao.className = "btn-config bg-[#ff3399] w-full py-2 rounded font-bold";
                    botao.onclick = () => window.open("https://discord.com/oauth2/authorize?client_id=SEU_ID_AQUI&permissions=8&scope=bot", "_blank");
                }
            }
        });
    } catch (error) {
        console.error("Erro ao sincronizar servidores:", error);
    }
}

function abrirConfigLimpeza(nomeServidor) {
    servidorSelecionado = nomeServidor;
    document.getElementById('lista-servidores').classList.add('hidden');
    document.getElementById('config-limpeza').classList.remove('hidden');
    document.getElementById('nome-servidor-atual').innerText = "Configurando: " + nomeServidor;
}

function voltarAoInicioBot() {
    document.getElementById('bot-landing').classList.remove('hidden');
    document.getElementById('lista-servidores').classList.add('hidden');
    document.getElementById('config-limpeza').classList.add('hidden');
}

function saibaMaisBot() {
    alert("AMZ BOT v1.0\n\nSistema de automação integrado com MongoDB.");
}

async function enviarConfiguracao() {
    const canalId = document.getElementById('canal_id').value;
    const dias = document.getElementById('dias').value;
    const statusMsg = document.getElementById('status_msg');
    const icon = document.getElementById('icon-sync');

    if(!canalId) {
        alert("Por favor, insira o ID do canal.");
        return;
    }

    icon.classList.add('animate-spin');
    statusMsg.classList.remove('hidden');
    statusMsg.innerText = "⏳ Gravando no MongoDB...";

    const URL_API = `${URL_BASE_BOT}/api/configurar-limpeza`;

    try {
        const response = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                servidor: servidorSelecionado, 
                canal_id: canalId, 
                dias: dias 
            })
        });

        if (response.ok) {
            statusMsg.innerText = "✅ Dados salvos com sucesso!";
            statusMsg.className = "text-[10px] uppercase tracking-widest text-center mt-4 text-green-400 font-bold";
        } else {
            statusMsg.innerText = "❌ Falha ao salvar.";
            statusMsg.className = "text-[10px] uppercase tracking-widest text-center mt-4 text-red-400";
        }
    } catch (error) {
        statusMsg.innerText = "❌ Erro de conexão.";
    } finally {
        icon.classList.remove('animate-spin');
    }
}