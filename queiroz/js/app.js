let contadorQuestoes = 0;
    let questions = [];
    let imagemEnunciadoData = null;
    let alinhamentoImagem = 'left'; // Padrão: esquerda
    let sequencialPorDisciplina = {}; // Para controlar o sequencial por disciplina
    let indexEmEdicao = null; // Variavel CRUCIAL adicionada para controlar se é edição ou questão nova!

    // Definição das disciplinas por ano (em ordem alfabética)
    const disciplinasPorAno = {
      primeiro: [
        "Arte", "Biologia", "Conceitos de Jogos Digitais", "Educação Física",
        "Filosofia", "Física", "Geografia", "Introdução a Lógica e Algoritmos",
        "Língua Estrangeira Moderna – Inglês", "Língua Portuguesa e Literatura",
        "Matemática", "Programação para Jogos Web I", "Química",
        "Técnicas de Desenho e Desenvolvimento de Game I"
      ],
      segundo: [
        "Arte", "Biologia", "Educação Física", "Filosofia", "Física", "Geografia",
        "Linguagem de Programação para Jogos I", "Língua Estrangeira Moderna – Inglês",
        "Língua Portuguesa e Literatura", "Matemática", "Modelagem 3D e Renderização I",
        "Programação Orientada a Objetos", "Programação para Jogos em Dispositivos Móveis",
        "Programação para Jogos Web II", "Química", "Técnicas de Desenho e Desenvolvimento de Game II"
      ],
      terceiro: [
        "Arte", "Biologia", "Desenvolvimento do Trabalho de Conclusão de Curso (TCC) em Programação de Jogos Digitais",
        "Educação Física", "Ética / Cidadania / Marketing", "Filosofia", "Física",
        "Fundamentos de Inteligência Artificial para Jogos Digitais", "Game Engine 3D",
        "Geografia", "Level Designer", "Linguagem de Programação para Jogos II",
        "Língua Estrangeira Moderna – Inglês", "Língua Portuguesa e Literatura",
        "Matemática", "Modelagem 3D e Renderização I", "Programação de Jogos em Rede",
        "Projeto de Experiências", "Química", "Técnicas e Linguagens para Banco de Dados",
        "Técnicas de Desenho e Desenvolvimento de Game III", "User Experience"
      ]
    };

    // Inicialização
    document.addEventListener('DOMContentLoaded', function() {
      carregarQuestoes();
      atualizarTipoPergunta();
      atualizarDisciplinas(); // Carrega as disciplinas do ano selecionado
      
      // Adiciona listeners para atualização em tempo real
      document.getElementById('referencia').addEventListener('input', atualizarPreview);
      document.getElementById('imagemEnunciado').addEventListener('change', handleEnunciadoImageUpload);
      document.getElementById('escalaImagem').addEventListener('input', atualizarPreview);
      document.getElementById('referenciaImagem').addEventListener('input', atualizarPreview);
      document.getElementById('ano').addEventListener('change', atualizarCodigoQuestao);
      document.getElementById('bimestre').addEventListener('change', atualizarCodigoQuestao);
      document.getElementById('materia').addEventListener('change', atualizarCodigoQuestao);
      
      // Carrega sequenciais salvos
      const sequencialSalvo = localStorage.getItem('sequencialPorDisciplina');
      if (sequencialSalvo) {
        sequencialPorDisciplina = JSON.parse(sequencialSalvo);
      }
    });

    // Função para gerar o código da questão
    function gerarCodigoQuestao() {
      const materia = document.getElementById("materia").value;
      const ano = document.getElementById("ano").value;
      const bimestre = document.getElementById("bimestre").value;
      
      if (!materia) return "-";
      
      // Obter o nome completo da matéria
      const materiaSelect = document.getElementById("materia");
      const materiaTexto = materiaSelect.options[materiaSelect.selectedIndex].text;
      
      // Gerar sigla (primeira letra de cada palavra, removendo números romanos)
      let sigla = materiaTexto
        .replace(/ I+$/i, '') // Remove I, II, III no final
        .split(' ')
        .map(palavra => palavra.charAt(0).toUpperCase())
        .join('');
      
      // Mapear ano para número
      const numeroAno = ano === 'primeiro' ? '1' : ano === 'segundo' ? '2' : '3';
      
      // Mapear bimestre para número
      const numeroBimestre = bimestre === 'primeiro' ? '1' : bimestre === 'segundo' ? '2' : bimestre === 'terceiro' ? '3' : '4';
      
      // Gerar chave para o sequencial
      const chaveSequencial = `${sigla}-${numeroAno}-${numeroBimestre}`;
      
      // Obter ou inicializar o sequencial para esta combinação
      if (!sequencialPorDisciplina[chaveSequencial]) {
        sequencialPorDisciplina[chaveSequencial] = 0;
      }
      
      // Só incrementa o sequencial se NÃO estiver editando uma questão (para não pular números)
      let numSeq = sequencialPorDisciplina[chaveSequencial];
      if (indexEmEdicao === null) {
          numSeq += 1;
      }
      
      // Formatar o número sequencial com 4 dígitos
      const sequencialFormatado = numSeq.toString().padStart(4, '0');
      
      // Retornar o código completo
      return `${sigla}${sequencialFormatado}${numeroBimestre}${numeroAno}`;
    }

    // Função para atualizar o código da questão na interface
    function atualizarCodigoQuestao() {
      const codigo = gerarCodigoQuestao();
      document.getElementById('codigoQuestao').textContent = codigo;
      atualizarPreview();
    }

    // Função para atualizar as disciplinas com base no ano selecionado
    function atualizarDisciplinas() {
      const anoSelecionado = document.getElementById("ano").value;
      const selectMateria = document.getElementById("materia");
      
      // Limpa as opções atuais
      selectMateria.innerHTML = '';
      
      // Adiciona as disciplinas do ano selecionado
      disciplinasPorAno[anoSelecionado].forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina.toLowerCase().replace(/\s+/g, '-');
        option.textContent = disciplina;
        selectMateria.appendChild(option);
      });
      
      atualizarCodigoQuestao();
    }

    function selecionarAlinhamento(align) {
      alinhamentoImagem = align;
      
      // Atualizar visualmente os botões
      document.querySelectorAll('.alignment-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`.alignment-btn[data-align="${align}"]`).classList.add('active');
      
      // Atualizar a prévia da imagem se existir
      if (imagemEnunciadoData) {
        const previewImg = document.querySelector('#previewImagemEnunciado img');
        if (previewImg) {
          previewImg.className = `image-preview image-${align}`;
        }
      }
      
      atualizarPreview();
    }

    function formatText(command, value = null) {
      document.execCommand(command, false, value);
      atualizarPreview();
    }

    function inserirFormulaLatex() {
      const latexFormula = prompt('Digite a fórmula LaTeX (use $ para fórmulas inline, $$ para centralizadas):', 'E = mc^2');
      if (latexFormula) {
        document.execCommand('insertHTML', false, `<span class="latex-formula">${latexFormula}</span>`);
        atualizarPreview();
      }
    }

    function inserirListaRomanos() {
      const itemCount = parseInt(prompt('Quantos itens na lista?', '3'));
      if (isNaN(itemCount) || itemCount <= 0) return;
      
      let listaHTML = '<ol style="list-style-type: upper-roman; padding-left: 1.5em;">';
      for (let i = 1; i <= itemCount; i++) {
        listaHTML += `<li>Item ${i}</li>`;
      }
      listaHTML += '</ol>';
      
      document.execCommand('insertHTML', false, listaHTML);
      atualizarPreview();
    }

    function handleEnunciadoImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      if (!file.type.match('image.*')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        imagemEnunciadoData = {
          src: e.target.result,
          scale: parseFloat(document.getElementById('escalaImagem').value) || 1,
          align: alinhamentoImagem
        };
        
        // Mostrar preview da imagem
        document.getElementById('previewImagemEnunciado').innerHTML = `
          <img src="${e.target.result}" class="image-preview image-${alinhamentoImagem}" style="width: ${100 * (parseFloat(document.getElementById('escalaImagem').value) || 1)}%;">
        `;
        
        atualizarPreview();
      };
      reader.readAsDataURL(file);
    }

    function atualizarTipoPergunta() {
      const tipo = document.getElementById("tipo").value;
      const alternativasBox = document.getElementById("alternativasBox");
      
      if (tipo === "unica" || tipo === "multipla") {
        alternativasBox.style.display = "block";
        // Adiciona duas alternativas por padrão
        if (document.getElementById("alternativas").children.length === 0) {
          adicionarAlternativa();
          adicionarAlternativa();
        }
      } else {
        alternativasBox.style.display = "none";
      }
      
      atualizarPreview();
    }

    function adicionarAlternativa() {
      adicionarAlternativaCompleta(false);
    }

    function adicionarAlternativaComImagem() {
      adicionarAlternativaCompleta(true);
    }

    function adicionarAlternativaCompleta(comImagem) {
      const container = document.getElementById("alternativas");
      const index = container.children.length;
      const letra = String.fromCharCode(97 + index); // a, b, c, d...

      const altItem = document.createElement('div');
      altItem.className = 'alt-item';
      altItem.innerHTML = `
        <input type="${document.getElementById('tipo').value === 'multipla' ? 'checkbox' : 'radio'}" 
               name="correta" value="${index}">
        <span class="alt-letter">${letra})</span>
      `;
      
      if (comImagem) {
        altItem.innerHTML += `
          <div style="flex: 1;">
            <input type="file" class="alt-image-input" accept="image/*" style="margin-bottom: 5px;">
            <div class="alignment-controls">
              <label>Alinhamento:</label>
              <button class="alignment-btn active" data-align="left" onclick="selecionarAlinhamentoAlternativa(this, ${index})">
                <i class="fas fa-align-left"></i>
              </button>
              <button class="alignment-btn" data-align="center" onclick="selecionarAlinhamentoAlternativa(this, ${index})">
                <i class="fas fa-align-center"></i>
              </button>
              <button class="alignment-btn" data-align="right" onclick="selecionarAlinhamentoAlternativa(this, ${index})">
                <i class="fas fa-align-right"></i>
              </button>
            </div>
            <div class="image-controls">
              <label>Escala:</label>
              <input type="number" class="alt-image-scale" min="0.1" max="3" step="0.1" value="1" style="width: 60px;">
            </div>
            <div class="alt-image-preview-container"></div>
          </div>
        `;
      } else {
        altItem.innerHTML += `
          <div class="editor-container" style="flex: 1;">
            <div class="editor-content" contenteditable="true" oninput="atualizarPreview()" placeholder="Texto da alternativa ${letra}"></div>
          </div>
        `;
      }
      
      altItem.innerHTML += `
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove(); reindexarAlternativas();">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      container.appendChild(altItem);
      
      // Adicionar event listeners para a alternativa com imagem
      if (comImagem) {
        const input = altItem.querySelector('.alt-image-input');
        const scale = altItem.querySelector('.alt-image-scale');
        const preview = altItem.querySelector('.alt-image-preview-container');
        
        input.addEventListener('change', function() {
          handleAlternativaImageUpload(this, preview, scale.value, 'left');
        });
        
        scale.addEventListener('input', function() {
          const img = preview.querySelector('img');
          if (img) {
            img.style.width = (100 * this.value) + '%';
          }
        });
      }
      
      atualizarPreview();
    }

    function reindexarAlternativas() {
      const altElements = document.getElementById("alternativas").children;
      for (let i = 0; i < altElements.length; i++) {
        const altItem = altElements[i];
        const input = altItem.querySelector('input[type="checkbox"], input[type="radio"]');
        const letterSpan = altItem.querySelector('.alt-letter');
        
        if (input) input.value = i;
        if (letterSpan) letterSpan.textContent = String.fromCharCode(97 + i) + ')';
      }
      atualizarPreview();
    }

    function selecionarAlinhamentoAlternativa(btn, index) {
      const altItem = document.getElementById("alternativas").children[index];
      if (!altItem) return;
      
      const alignment = btn.getAttribute('data-align');
      
      // Atualizar visualmente os botões
      altItem.querySelectorAll('.alignment-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      
      // Atualizar a prévia da imagem se existir
      const previewImg = altItem.querySelector('.alt-image-preview-container img');
      if (previewImg) {
        previewImg.className = `alt-image-preview image-${alignment}`;
      }
      
      atualizarPreview();
    }

    function handleAlternativaImageUpload(input, previewContainer, scale, alignment) {
      const file = input.files[0];
      if (!file) return;
      
      if (!file.type.match('image.*')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        previewContainer.innerHTML = `
          <img src="${e.target.result}" class="alt-image-preview image-${alignment}" style="width: ${100 * scale}%;">
        `;
        atualizarPreview();
      };
      reader.readAsDataURL(file);
    }

    function adicionarQuestao() {
      const enunciado = document.getElementById("enunciado").innerHTML;
      const referencia = document.getElementById("referencia").value;
      const tipo = document.getElementById("tipo").value;
      const ano = document.getElementById("ano").value;
      const bimestre = document.getElementById("bimestre").value;
      const materiaSelect = document.getElementById("materia");
      const materia = materiaSelect.options[materiaSelect.selectedIndex].text;
      const tags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
      const escalaImagem = parseFloat(document.getElementById("escalaImagem").value) || 1;
      const referenciaImagem = document.getElementById("referenciaImagem").value;
      
      // Coleta o código. Se for nova questão, atualiza também no localStorage o sequencial
      const codigoQuestao = document.getElementById("codigoQuestao").textContent;
      if(indexEmEdicao === null){
          const siglaInfo = codigoQuestao.substring(0, codigoQuestao.length - 6);
          const bimestreAno = codigoQuestao.substring(codigoQuestao.length - 2);
          const numAno = bimestreAno.charAt(1);
          const numBim = bimestreAno.charAt(0);
          const chaveSequencial = `${siglaInfo}-${numAno}-${numBim}`;
          if (sequencialPorDisciplina[chaveSequencial] !== undefined) {
              sequencialPorDisciplina[chaveSequencial]++;
              localStorage.setItem('sequencialPorDisciplina', JSON.stringify(sequencialPorDisciplina));
          }
      }
      
      // Coletar alternativas se aplicável
      let alternativas = [];
      if (tipo === "unica" || tipo === "multipla") {
        const altElements = document.getElementById("alternativas").children;
        const corretaElements = document.getElementById("alternativas").querySelectorAll('input:checked');
        
        let corretaIndices = [];
        corretaElements.forEach(el => corretaIndices.push(parseInt(el.value)));
        
        for (let i = 0; i < altElements.length; i++) {
          const altItem = altElements[i];
          const editor = altItem.querySelector('.editor-content');
          const imageInput = altItem.querySelector('.alt-image-input');
          const imageScale = parseFloat(altItem.querySelector('.alt-image-scale')?.value) || 1;
          const imagePreview = altItem.querySelector('.alt-image-preview-container img');
          const alignmentBtn = altItem.querySelector('.alignment-btn.active');
          const imageAlign = alignmentBtn ? alignmentBtn.getAttribute('data-align') : 'left';
          
          let alternativa = {
            correta: corretaIndices.includes(i)
          };
          
          if (editor) {
            alternativa.texto = editor.innerHTML;
            alternativa.tipo = 'texto';
          } else if (imageInput && imageInput.files[0]) {
            alternativa.tipo = 'imagem';
            alternativa.imagemSrc = imagePreview.src;
            alternativa.imagemScale = imageScale;
            alternativa.imagemAlign = imageAlign;
          } else if (imagePreview && imagePreview.src) {
            // Mantém a imagem caso esteja sendo editada e o usuário não enviou uma nova
            alternativa.tipo = 'imagem';
            alternativa.imagemSrc = imagePreview.src;
            alternativa.imagemScale = imageScale;
            alternativa.imagemAlign = imageAlign;
          }
          
          alternativas.push(alternativa);
        }
      }
      
      // Criar objeto questão (COM INTELIGÊNCIA DE EDIÇÃO)
      const questao = {
        id: indexEmEdicao !== null ? questions[indexEmEdicao].id : Date.now(),
        codigo: codigoQuestao,
        enunciado: enunciado,
        referencia: referencia,
        tipo: tipo,
        ano: ano,
        bimestre: bimestre,
        materia: materia,
        tags: tags,
        alternativas: alternativas,
        dataCriacao: indexEmEdicao !== null ? questions[indexEmEdicao].dataCriacao : new Date().toLocaleString('pt-BR')
      };
      
      // Adicionar imagem do enunciado se houver
      if (imagemEnunciadoData) {
        questao.imagemEnunciado = imagemEnunciadoData.src;
        questao.imagemScale = escalaImagem;
        questao.imagemAlign = alinhamentoImagem;
        questao.referenciaImagem = referenciaImagem;
      }
      
      // VERIFICA SE ESTÁ SALVANDO UMA NOVA OU SUBSTITUINDO UMA ANTIGA
      if (indexEmEdicao !== null) {
          questions[indexEmEdicao] = questao; // Substitui a questão antiga
          alert('Questão atualizada com sucesso!');
          indexEmEdicao = null; // Reseta o rastreador
      } else {
          questions.push(questao); // Adiciona uma nova questão
          alert('Nova questão salva com sucesso!');
      }
      
      salvarQuestoes(); 
      renderizarQuestoes();
      limparFormulario(false); // Chama limpar formulário sem perguntar
    }

    function renderizarQuestoes() {
      const preview = document.getElementById("preview");
      preview.innerHTML = '';
      
      if (questions.length === 0) {
        preview.innerHTML = '<p class="instruction-text">Nenhuma questão salva ainda.</p>';
        return;
      }
      
      questions.forEach((questao, index) => {
        const questaoElement = document.createElement('div');
        questaoElement.className = 'pergunta';
        
        questaoElement.innerHTML = `
          <div class="pergunta-number">${index + 1}</div>
          <div class="codigo-questao">${questao.codigo}</div>
          <div>${questao.enunciado}</div>
          ${questao.referencia ? `<p class="reference">Fonte: ${questao.referencia}</p>` : ''}
        `;
        
        // Adicionar imagem do enunciado se existir
        if (questao.imagemEnunciado) {
          questaoElement.innerHTML += `
            <div class="image-section clearfix">
              <img src="${questao.imagemEnunciado}" class="image-preview image-${questao.imagemAlign || 'left'}" style="width: ${100 * (questao.imagemScale || 1)}%;">
              ${questao.referenciaImagem ? `<p class="reference">Fonte da imagem: ${questao.referenciaImagem}</p>` : ''}
            </div>
          `;
        }
        
        questaoElement.innerHTML += `
          <p><strong>Tipo:</strong> ${getTipoTexto(questao.tipo)}</p>
          <p><strong>Ano:</strong> ${getAnoTexto(questao.ano)}</p>
          <p><strong>Bimestre:</strong> ${getBimestreTexto(questao.bimestre)}</p>
          <p><strong>Matéria:</strong> ${questao.materia}</p>
          <p><strong>Tags:</strong> ${questao.tags.join(', ')}</p>
          <p><strong>Criada em:</strong> ${questao.dataCriacao}</p>
        `;
        
        if (questao.alternativas && questao.alternativas.length > 0) {
          let alternativasHTML = '<ol type="a">';
          questao.alternativas.forEach(alt => {
            if (alt.tipo === 'texto') {
              alternativasHTML += `<li>${alt.texto} ${alt.correta ? ' <i class="fas fa-check" style="color: green;"></i>' : ''}</li>`;
            } else if (alt.tipo === 'imagem') {
              alternativasHTML += `
                <li>
                  <img src="${alt.imagemSrc}" class="alt-image-preview image-${alt.imagemAlign || 'left'}" style="width: ${100 * (alt.imagemScale || 1)}%;">
                  ${alt.correta ? ' <i class="fas fa-check" style="color: green;"></i>' : ''}
                </li>`;
            }
          });
          alternativasHTML += '</ol>';
          questaoElement.innerHTML += alternativasHTML;
        }
        
        // Botões de ação
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';
        actionDiv.innerHTML = `
          <button class="btn btn-primary btn-sm" onclick="editarQuestao(${questao.id})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="removerQuestao(${questao.id})">
            <i class="fas fa-trash"></i> Remover
          </button>
        `;
        
        questaoElement.appendChild(actionDiv);
        preview.appendChild(questaoElement);
      });
      
      // Renderizar fórmulas LaTeX
      if (window.MathJax) {
        MathJax.typesetPromise();
      }
    }

    function atualizarPreview() {
      const enunciado = document.getElementById("enunciado").innerHTML;
      const referencia = document.getElementById("referencia").value;
      const tipo = document.getElementById("tipo").value;
      const ano = document.getElementById("ano").value;
      const bimestre = document.getElementById("bimestre").value;
      const materiaSelect = document.getElementById("materia");
      const materia = materiaSelect.options[materiaSelect.selectedIndex]?.text || '';
      const escalaImagem = parseFloat(document.getElementById("escalaImagem").value) || 1;
      const referenciaImagem = document.getElementById("referenciaImagem").value;
      const codigoQuestao = document.getElementById("codigoQuestao").textContent;
      
      const preview = document.querySelector('.latex-preview');
      preview.innerHTML = '<h3><i class="fas fa-square-root-alt"></i> Renderização LaTeX</h3>';
      
      preview.innerHTML += `<div class="codigo-questao">${codigoQuestao}</div>`;
      
      if (enunciado) {
        preview.innerHTML += `<div>${enunciado}</div>`;
      } else {
        preview.innerHTML += '<p>Digite algo no enunciado para ver a pré-visualização das fórmulas.</p>';
      }
      
      if (referencia) {
        preview.innerHTML += `<p class="reference">Fonte: ${referencia}</p>`;
      }
      
      if (materia) {
        preview.innerHTML += `<p><strong>Disciplina:</strong> ${materia}</p>`;
      }
      
      // Adicionar imagem do enunciado na preview se houver
      if (imagemEnunciadoData) {
        preview.innerHTML += `
          <div class="image-section clearfix">
            <img src="${imagemEnunciadoData.src}" class="image-preview image-${alinhamentoImagem}" style="width: ${100 * escalaImagem}%;">
            ${referenciaImagem ? `<p class="reference">Fonte da imagem: ${referenciaImagem}</p>` : ''}
          </div>
        `;
      }
      
      // Adicionar alternativas na preview se houver
      if (tipo === "unica" || tipo === "multipla") {
        const altElements = document.getElementById("alternativas").children;
        if (altElements.length > 0) {
          preview.innerHTML += '<p><strong>Alternativas:</strong></p><ol type="a">';
          
          for (let i = 0; i < altElements.length; i++) {
            const altItem = altElements[i];
            const editor = altItem.querySelector('.editor-content');
            const imagePreview = altItem.querySelector('.alt-image-preview-container img');
            
            if (editor) {
              preview.innerHTML += `<li>${editor.innerHTML || '[Texto da alternativa]'}</li>`;
            } else if (imagePreview) {
              const scale = parseFloat(altItem.querySelector('.alt-image-scale').value) || 1;
              const alignmentBtn = altItem.querySelector('.alignment-btn.active');
              const alignment = alignmentBtn ? alignmentBtn.getAttribute('data-align') : 'left';
              preview.innerHTML += `<li><img src="${imagePreview.src}" class="alt-image-preview image-${alignment}" style="width: ${100 * scale}%;"></li>`;
            } else {
              preview.innerHTML += `<li>[Alternativa]</li>`;
            }
          }
          
          preview.innerHTML += '</ol>';
        }
      }
      
      // Renderizar fórmulas LaTeX
      if (window.MathJax) {
        MathJax.typesetPromise();
      }
    }

    function limparFormulario(exigirConfirmacao = true) {
      if (!exigirConfirmacao || confirm('Tem certeza que deseja limpar todos os campos?')) {
        indexEmEdicao = null; // ESQUECE A EDIÇÃO!
        
        document.getElementById('enunciado').innerHTML = '';
        document.getElementById('referencia').value = '';
        document.getElementById('tipo').value = 'texto';
        document.getElementById('ano').value = 'primeiro';
        document.getElementById('bimestre').value = 'primeiro';
        document.getElementById('tags').value = '';
        document.getElementById('imagemEnunciado').value = '';
        document.getElementById('escalaImagem').value = '1';
        document.getElementById('referenciaImagem').value = '';
        document.getElementById('alternativas').innerHTML = '';
        imagemEnunciadoData = null;
        alinhamentoImagem = 'left';
        
        // Resetar botões de alinhamento
        document.querySelectorAll('.alignment-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        document.querySelector('.alignment-btn[data-align="left"]').classList.add('active');
        
        document.getElementById('previewImagemEnunciado').innerHTML = '';
        
        // Atualizar disciplinas após limpar
        atualizarDisciplinas();
        atualizarTipoPergunta();
        atualizarPreview();
      }
    }

    function getTipoTexto(tipo) {
      const tipos = {
        'texto': 'Resposta Textual',
        'unica': 'Escolha Única',
        'multipla': 'Múltipla Escolha',
        'verdadeirofalse': 'Verdadeiro ou Falso'
      };
      return tipos[tipo] || tipo;
    }

    function getAnoTexto(ano) {
      const anos = {
        'primeiro': 'Primeiro Ano',
        'segundo': 'Segundo Ano',
        'terceiro': 'Terceiro Ano'
      };
      return anos[ano] || ano;
    }

    function getBimestreTexto(bimestre) {
      const bimestres = {
        'primeiro': 'Primeiro Bimestre',
        'segundo': 'Segundo Bimestre',
        'terceiro': 'Terceiro Bimestre',
        'quarto': 'Quarto Bimestre'
      };
      return bimestres[bimestre] || bimestre;
    }

    function salvarQuestoes() {
      localStorage.setItem('questoesLatex', JSON.stringify(questions));
    }

    function carregarQuestoes() {
      const saved = localStorage.getItem('questoesLatex');
      if (saved) {
        questions = JSON.parse(saved);
        renderizarQuestoes();
      }
    }

    function removerQuestao(id) {
      if (confirm('Tem certeza que deseja remover esta questão?')) {
        questions = questions.filter(q => q.id !== id);
        salvarQuestoes();
        renderizarQuestoes();
      }
    }

    function editarQuestao(id) {
      // 1. Descobre qual é a questão na lista e MARCA ELA COMO A QUESTÃO SENDO EDITADA
      const index = questions.findIndex(q => q.id === id);
      
      if (index !== -1) {
        indexEmEdicao = index; // ESSA LINHA FAZ TODA A MÁGICA DE NÃO DUPLICAR MAIS!
        const questao = questions[index];
        
        document.getElementById('enunciado').innerHTML = questao.enunciado;
        document.getElementById('referencia').value = questao.referencia || '';
        document.getElementById('tipo').value = questao.tipo;
        document.getElementById('ano').value = questao.ano;
        document.getElementById('bimestre').value = questao.bimestre || 'primeiro';
        document.getElementById('tags').value = questao.tags.join(', ');
        
        // Atualizar disciplinas primeiro
        atualizarDisciplinas();
        
        // Selecionar a matéria correta
        const materiaSelect = document.getElementById('materia');
        for (let i = 0; i < materiaSelect.options.length; i++) {
          if (materiaSelect.options[i].text === questao.materia) {
            materiaSelect.selectedIndex = i;
            break;
          }
        }
        
        // Fixa o código da questão que está sendo editada no visor
        document.getElementById('codigoQuestao').textContent = questao.codigo;
        
        // Limpar e preencher alternativas se houver
        const container = document.getElementById('alternativas');
        container.innerHTML = '';
        
        if (questao.alternativas && questao.alternativas.length > 0) {
          questao.alternativas.forEach((alt, idx) => {
            if (alt.tipo === 'texto') {
              adicionarAlternativa();
              const editors = container.querySelectorAll('.editor-content');
              editors[idx].innerHTML = alt.texto;
            } else if (alt.tipo === 'imagem') {
              adicionarAlternativaComImagem();
              // A imagem já fica salva pela lógica no AdicionarQuestão
              const previewContainers = container.querySelectorAll('.alt-image-preview-container');
              if (previewContainers[idx]) {
                previewContainers[idx].innerHTML = `
                  <img src="${alt.imagemSrc}" class="alt-image-preview image-${alt.imagemAlign}" style="width: ${100 * alt.imagemScale}%;">
                `;
              }
            }
            
            // Marcar como correta se for o caso
            if (alt.correta) {
              const inputs = container.querySelectorAll('input[type="checkbox"], input[type="radio"]');
              inputs[idx].checked = true;
            }
          });
        }
        
        // Preencher dados da imagem do enunciado se houver
        if (questao.imagemEnunciado) {
          imagemEnunciadoData = {
            src: questao.imagemEnunciado,
            scale: questao.imagemScale || 1
          };
          document.getElementById('escalaImagem').value = questao.imagemScale || 1;
          document.getElementById('referenciaImagem').value = questao.referenciaImagem || '';
          alinhamentoImagem = questao.imagemAlign || 'left';
          
          // Atualizar botões de alinhamento
          document.querySelectorAll('.alignment-btn').forEach(btn => {
            btn.classList.remove('active');
          });
          document.querySelector(`.alignment-btn[data-align="${alinhamentoImagem}"]`).classList.add('active');
          
          // Mostrar preview da imagem
          document.getElementById('previewImagemEnunciado').innerHTML = `
            <img src="${questao.imagemEnunciado}" class="image-preview image-${alinhamentoImagem}" style="width: ${100 * (questao.imagemScale || 1)}%;">
          `;
        } else {
            document.getElementById('previewImagemEnunciado').innerHTML = '';
            imagemEnunciadoData = null;
        }
        
        atualizarTipoPergunta();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela suavemente para editar
      }
    }