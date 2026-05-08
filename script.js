// --- VARIÁVEIS GLOBAIS ---
let servidorSelecionado = null;
// URL do seu Bot no Render
const URL_BASE_BOT = "https://celestial-bot-zj6o.onrender.com";

// --- FUNÇÕES DE NAVEGAÇÃO ---

function mostrarPainel() {
    document.getElementById('site-principal').classList.add('hidden');
    const painel = document.getElementById('painel-loritta');
    painel.classList.remove('hidden');
    painel.classList.add('flex');
    voltarAoInicioBot();
    window.scrollTo(0, 0);
}

function voltarAoInicio() {
    document.getElementById('painel-loritta').classList.add('hidden');
    const site = document.getElementById('site-principal');
    site.classList.remove('hidden');
    site.classList.add('flex');
}

function voltarAoInicioBot() {
    document.getElementById('bot-landing').classList.remove('hidden');
    document.getElementById('lista-servidores').classList.add('hidden');
    document.getElementById('config-limpeza').classList.add('hidden');
}

// --- LÓGICA DOS SERVIDORES (GERAÇÃO AUTOMÁTICA) ---

async function abrirListaServidores() {
    document.getElementById('bot-landing').classList.add('hidden');
    document.getElementById('config-limpeza').classList.add('hidden');
    document.getElementById('lista-servidores').classList.remove('hidden');

    const container = document.getElementById('container-servidores');
    
    // Feedback visual de carregamento
    container.innerHTML = '<p class="text-white/50 col-span-2 text-center animate-pulse py-10 uppercase text-[10px] tracking-widest">Consultando MongoDB via Render...</p>';

    try {
        // 1. Busca a lista de servidores ativos no seu Bot
        const response = await fetch(`${URL_BASE_BOT}/api/bot-servidores`);
        const servidores = await response.json();

        container.innerHTML = ""; // Limpa a mensagem de carregamento

        if (!servidores || servidores.length === 0) {
            container.innerHTML = '<p class="text-white/50 col-span-2 text-center py-10">Nenhum servidor ativo encontrado. Adicione o bot primeiro!</p>';
            return;
        }

        // 2. Cria os cards dinamicamente para cada servidor que vier do banco
        servidores.forEach(srv => {
            const card = document.createElement('div');
            card.className = "server-card p-6 bg-[#111] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/20 transition-all";
            
            card.innerHTML = `
                <div class="flex items-center gap-4">
                    <img src="./assets/logo.png" alt="Icon" class="w-12 h-12 grayscale p-2 bg-black rounded-lg">
                    <div>
                        <h4 class="text-white font-bold text-sm">${srv.nome || "Servidor AMZ"}</h4>
                        <p class="text-neutral-500 text-[10px] uppercase tracking-widest">ID: ${srv.guild_id}</p>
                    </div>
                </div>
                <button onclick="abrirConfigLimpeza('${srv.guild_id}', '${srv.nome}')" 
                        class="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 px-6 rounded uppercase transition shadow-lg shadow-blue-900/20">
                    Configurar
                </button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = '<p class="text-red-400 col-span-2 text-center py-10 uppercase text-[10px]">Erro de conexão com a API do Render.</p>';
    }
}

function abrirConfigLimpeza(guildId, nome) {
    servidorSelecionado = guildId; // Agora salvamos o ID para garantir precisão no banco
    document.getElementById('lista-servidores').classList.add('hidden');
    document.getElementById('config-limpeza').classList.remove('hidden');
    document.getElementById('nome-servidor-atual').innerText = nome;
}

// --- ENVIO DE DADOS ---

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
    statusMsg.innerText = "⏳ Sincronizando com MongoDB...";

    try {
        const response = await fetch(`${URL_BASE_BOT}/api/configurar-limpeza`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                servidor: servidorSelecionado, 
                canal_id: canalId, 
                dias: dias 
            })
        });

        if (response.ok) {
            statusMsg.innerText = "✅ Sincronizado com sucesso!";
            statusMsg.className = "text-[10px] uppercase tracking-widest text-center mt-4 text-green-400 font-bold";
        } else {
            throw new Error();
        }
    } catch (error) {
        statusMsg.innerText = "❌ Erro ao salvar configurações.";
        statusMsg.className = "text-[10px] uppercase tracking-widest text-center mt-4 text-red-400 font-bold";
    } finally {
        icon.classList.remove('animate-spin');
    }
}