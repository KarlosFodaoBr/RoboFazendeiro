var ii = 0
var hh = 0

function AtualizaData() {
    let data = null;
    $.ajax({
        url: 'http://farmbotapi.elementfx.com/GETDATA.php',
        method: 'GET',
        dataType: 'json',
        async: false, // Torna a chamada síncrona
        success: function(response) {
            data = response;
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', status, error);
        }
    });
    return data;
}

var dados = AtualizaData();
var ligadoo;

if(parseFloat(dados.DadosGerais[0].Ligado) == 1){
    document.getElementById("BotaoAlternaLigar").style.backgroundColor = "green";
    ligadoo = 1
        }else{
    document.getElementById("BotaoAlternaLigar").style.backgroundColor = "red";
    ligadoo = 0
        }

        var manda

function ligado(){
    
if(ligadoo == 1){
     manda = 0;
}
if(ligadoo == 0){
     manda = 1;
}

$.ajax({
    url: 'http://farmbotapi.elementfx.com/POSTDATA.php',
    method: 'POST',
    data: {DadosLigado: manda},
    async: false
});

dados = AtualizaData()
console.log(dados);

if(dados.DadosGerais[0].Ligado == 1){
    document.getElementById("BotaoAlternaLigar").style.backgroundColor = "green";
    ligadoo = 1
        }else{
    document.getElementById("BotaoAlternaLigar").style.backgroundColor = "red";
    ligadoo = 0
        }
        console.log(ligadoo);
}

/*
// Percorre o array 'dados_segundos' e extrai os valores
dados.dados_segundos.forEach(function(item) {
    chuvas.push(item.Chuva);
    umidades.push(item.Umidade);
    datas.push(item.Data);
});
*/

function converteChuva(valor) {
    return valor === "Nao" ? 0 : 1;
}

// Exemplo de uso dos arrays criados
console.log(dados);

var ContDiario;
var ultimoDiaComDados;

let PegaOsDadosDeHj = {
    VerificaSeEHj: function(DataVerificar) {
        let partesDataDia = DataVerificar.split(" ");
        let partesData = partesDataDia[0].split("-");
        let dataFormatada = partesData[1] + "/" + partesData[2] + "/" + partesData[0];
        return new Date().toDateString() === new Date(dataFormatada).toDateString();
    },
    filtrarPorHoje: function(dados) {
        let dadosHoje = {
            "dados_segundos": [],
            UltDiaCDados: null
        };

        ContDiario = dados.dados_segundos.some(item => PegaOsDadosDeHj.VerificaSeEHj(item.Data));

        if (ContDiario) {
            dados.dados_segundos.forEach(function(item) {
                if (PegaOsDadosDeHj.VerificaSeEHj(item.Data)) {
                    dadosHoje.dados_segundos.push(item);
                }
            })
        } else {
            dados.dados_segundos.forEach(function(item) {
                dadosHoje.dados_segundos.push(item);
            })
        }
        dadosHoje.UltDiaCDados = dados.dados_segundos[dados.dados_segundos.length - 1].Data
            /*
            dados.medias_diarias.forEach(function(item) {
                if (Utils.isHoje(item.Data)) {
                    dadosHoje.medias_diarias.push(item);
                }
            });
            */
        return dadosHoje;
    }
}
let PegaOsDadosMensais = {
    VerificaSeEMensal: function(DataVerificar) {
        let partesData = DataVerificar.split("-");
        let dataFormatada = partesData[1] + "/" + partesData[2] + "/" + partesData[0];
        return new Date(dataFormatada).getMonth() === new Date().getMonth() &&
            new Date(dataFormatada).getFullYear() === new Date().getFullYear()
    },
    filtrarPorMes: function(dados) {

        let dadosHoje = {
            "medias_diarias": [],
            mes: null,
            ano: null
        };

        let Q = 0;
        let Menos = 0;

        testaMes()

        function testaMes() {
            dados.medias_diarias.forEach(function(item) {
                if (PegaOsDadosMensais.VerificaSeEMensal(new Date(new Date(item.Data).setMonth(new Date(item.Data).getMonth() + Menos)).toISOString().split('T')[0])) {
                    Q++
                    dadosHoje.medias_diarias.push(item)
                }
            });
        }

        while (Q == 0 && Menos < 12) {
            Menos++
            testaMes()
        }

        if (dadosHoje.medias_diarias.length > 0) {
            dadosHoje.mes = dadosHoje.medias_diarias[0].Data.split('-')[1]
            dadosHoje.ano = dadosHoje.medias_diarias[0].Data.split('-')[0]
        } else {
            dadosHoje.mes = '00'
            dadosHoje.ano = '0000'
        }

        return dadosHoje
    }
}
let DadosDeHoje = {
    chuvas: [],
    umidades: [],
    datas: []
}
let DadosDoMes = {
    chuvas: [],
    umidades: [],
    datas: [],
    UltimoMes: null,
    UltimoAno: null
}
let DadosDoAno = {
    chuvas: [],
    umidades: [],
    datas: []
}

function LimitarTamanhoObj(Arr, Tam) {
    return Arr.slice(0, Tam)
}

function dataFormatadaSeparada(DataVerificar) {
    return DataVerificar.split(" ");
}

function dataFormatadaSeparadaHora(DataVerificar) {
    return DataVerificar.split(':');
}

function DadosDeHojeUmPorUmLimitado() {

    DadosDeHoje.chuvas = [];
    DadosDeHoje.umidades = [];
    DadosDeHoje.datas = [];

    let horasSalvas = new Set();
    PegaOsDadosDeHj.filtrarPorHoje(dados).dados_segundos.forEach((item, index) => {
        let HoraItem = dataFormatadaSeparadaHora(dataFormatadaSeparada(item.Data)[1])[0]
        if (!horasSalvas.has(HoraItem)) {
            DadosDeHoje.chuvas.push(converteChuva(item.Chuva));
            DadosDeHoje.umidades.push(item.Umidade);
            DadosDeHoje.datas.push(dataFormatadaSeparada(item.Data)[1]);

            horasSalvas.add(HoraItem)
        }
    });
}
DadosDeHojeUmPorUmLimitado()

function DadosDoMesUmPorUmLimitado() {
    DadosDoMes.chuvas = []
    DadosDoMes.umidades = []
    DadosDoMes.datas = []
    DadosDoMes.UltimoMes = null

    PegaOsDadosMensais.filtrarPorMes(dados).medias_diarias.forEach((item) => {
        DadosDoMes.chuvas.push(item.Chuva)
        DadosDoMes.umidades.push(item.Umidade)
        DadosDoMes.datas.push(item.Data)
    })
    DadosDoMes.UltimoMes = (PegaOsDadosMensais.filtrarPorMes(dados).mes)
    DadosDoMes.UltimoAno = (PegaOsDadosMensais.filtrarPorMes(dados).ano)
}
DadosDoMesUmPorUmLimitado()
let MMC = 5;
TabelaUltimosLançamentos()

function TabelaUltimosLançamentos() {
    MMC += 5;
    $('#UltimosLançamentosTBody').html('')
    $('#UltimosLançamentosTFoot').html('')
    LimitarTamanhoObj(dados.dados_segundos.reverse(), MMC).forEach((e) => {
        $('#UltimosLançamentosTBody').append(`
                            <tr>
                                <th scope="row">${e.ID}</th>
                                <td>${e.Data}</td>
                                <td>${e.Umidade}%</td>
                                <td>${e.Chuva}</td>
                            </tr>
        `);
    })
    $('#UltimosLançamentosTFoot').append(`
            <button class="btn btn-light border rounded-4 border-2 w-75" onclick="TabelaUltimosLançamentos(MMC)">MAIS 5</button>
        `)
}

//alert(new Date().toDateString())
const backgroundPlugin = {
    id: 'backgroundPlugin',
    beforeDraw: (chart) => {
        const { ctx, chartArea: { top, bottom, left, right, height }, scales: { y } } = chart;

        // Converte os valores dos dados para posições no gráfico
        const yValueToPixel = value => y.getPixelForValue(value);

        // Define as cores e as áreas
        const colors = [
            { color: 'rgba(255, 0, 0, 0.3)', start: bottom, end: yValueToPixel(30) }, // Verde abaixo de 30
            { color: 'rgba(255, 255, 0, 0.3)', start: yValueToPixel(30), end: yValueToPixel(80) }, // Amarelo entre 30 e 80
            { color: 'rgba(0, 255, 0, 0.3)', start: yValueToPixel(80), end: top } // Vermelho acima de 80
        ];

        colors.forEach(({ color, start, end }) => {
            ctx.save();
            ctx.fillStyle = color;
            ctx.fillRect(left, end, right - left, start - end);
            ctx.restore();
        });

        // Adiciona a legenda
        const legendItems = [
            { text: 'Solo seco (0-30)', color: 'rgba(255, 0, 0, 0.3)' },
            { text: 'Solo moderado (30-80)', color: 'rgba(255, 255, 0, 0.3)' },
            { text: 'Solo úmido (80-100)', color: 'rgba(0, 255, 0, 0.3)' }
        ];

        const legendWidth = legendItems.reduce((acc, item) => {
            return acc + ctx.measureText(item.text).width + 50; // Espaço para o quadrado de cor e texto
        }, 0);
        const legendX = (right + left - legendWidth) / 2; // Posiciona a legenda centralizada horizontalmente
        const legendY = bottom + 75; // Posiciona a legenda logo abaixo do gráfico
        const legendSpacing = 200; // Espaçamento horizontal entre itens da legenda

        // Adiciona a legenda
        legendItems.forEach((item, index) => {
            const startX = legendX + index * legendSpacing;

            ctx.save();
            ctx.fillStyle = item.color;
            ctx.fillRect(startX, legendY, 10, 10);
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(item.text, startX + 15, legendY + 10);
            ctx.restore();
        });
    }
};
Chart.register(backgroundPlugin);

// Dados e configurações do gráfico
let dataLine = {
    type: "line",
    data: {
        labels: preencherHorasFaltantes(DadosDeHoje.datas),
        datasets: [{
                label: "Umidade",
                data: preencherUmidadeEChuvaFaltantes(DadosDeHoje.datas, DadosDeHoje.umidades),
                borderColor: "rgb(1, 151, 252)",
                backgroundColor: "rgb(34, 0, 255)",
                fill: false,
                cubicInterpolationMode: 'monotone', // Adiciona suavização
            },
            {
                label: "Chuva",
                data: preencherUmidadeEChuvaFaltantes(DadosDeHoje.chuvas, DadosDeHoje.chuvas),
                borderColor: "rgb(34, 159, 53)",
                backgroundColor: "rgb(24, 79, 11)",
                fill: false,
            }
        ],
    },
    options: {
        scales: {
            y: {
                min: 0,
                max: 100
            }
        },
        plugins: {
            backgroundPlugin: true
        },
        layout: {
            padding: {
                bottom: 75 // Ajusta o padding inferior para garantir espaço para a legenda
            }
        }
    }
};

const ctx = document.getElementById('chart-line').getContext('2d');
const myChart = new Chart('chart-line', dataLine);

let currentURL = window.location.pathname.split("/").filter(Boolean).pop();
console.log(currentURL)
let urlMap = {
    "index.html": "inicio",
    "SobreNos": "sobreNos",
    "dashboard": "dashboard"
};
if (urlMap[currentURL]) {
    document.getElementById(urlMap[currentURL]).classList.add('active');
    document.getElementById(urlMap[currentURL]).classList.remove('btn-outline-warning');
    document.getElementById(urlMap[currentURL]).classList.add('btn-warning');
}

let Elementos = document.querySelectorAll('.AnimOff')
Elementos.forEach((e) => Observador.observe(e))

let EBotaoLink = document.querySelectorAll('[data-href]')
EBotaoLink.forEach((x) => {
    x.addEventListener('click', (y) => {

        let win = window.open(x.getAttribute('data-href'), '_self');
        win.focus();
    })
})

function SidBarSelect(type) {
    document.querySelectorAll('.contentMain').forEach((x) => {
        if (x.id == type) {
            x.style.display = 'block';
        } else {
            x.style.display = 'none';
        }
    })
}



// Array de labels reais (com horas e minutos)


// Função para extrair apenas as horas (HH:00) dos labels reais
function extrairHoras(labelsReais) {
    return labelsReais.map(label => {
        // Extrai apenas a parte da hora, ignorando os minutos e segundos
        return label.split(':')[0] + ':00:00';
    });
}

// Função para preencher as horas faltantes no array de labels




function preencherUmidadeEChuvaFaltantes(datasOriginal, UmidadesOriginal, fim = 24) {

    let data = datasOriginal.slice()
    let Umidade = UmidadesOriginal.slice()

    let MenosUns = Array(fim).fill(-1);
    let NumeroAModificar = [];

    data.forEach((e) => {
        if (typeof e === 'string') {
            NumeroAModificar.push(parseFloat(e.split(':')[0]));
        }
    })

    NumeroAModificar.forEach((e, index) => {
        MenosUns[e] = Umidade[index]
    })
    return MenosUns;
}

function preencherUmidadeEChuvaFaltantesMes(datasOriginal, UmidadesOriginal, fim = 12) {
    let data = datasOriginal.slice()
    let Umidade = UmidadesOriginal.slice()

    let MenosUns = Array(fim).fill(-1);
    let NumeroAModificar = [];

    data.forEach((e) => {
        if (typeof e === 'string') {
            NumeroAModificar.push(parseFloat(e.split('-')[1]));
        }
    })
    console.log(NumeroAModificar)
    NumeroAModificar.forEach((e, index) => {
        MenosUns[e - 1] = Umidade[index]
    })
    return MenosUns;
}

function preencherUmidadeEChuvaFaltantesDia(datasOriginal, UmidadesOriginal) {
    let data = datasOriginal.slice()
    let Umidade = UmidadesOriginal.slice()

    let fim = new Date(data[0].split('-')[0], data[0].split('-')[1], 0).getDate()

    let MenosUns = Array(fim).fill(-1);
    let NumeroAModificar = [];

    data.forEach((e) => {
        if (typeof e === 'string') {
            NumeroAModificar.push(parseFloat(e.split('-')[2]));
        }
    })
    console.log(NumeroAModificar)
    NumeroAModificar.forEach((e, index) => {
        MenosUns[e - 1] = Umidade[index]
    })
    return MenosUns;
}



function preencherHorasFaltantes(labelsReais) {
    hh = 0
    ii = 0

    function Addii() {
        ii++
        return labelsReais[ii - 1]
    }

    function Addhora(x) {
        if (ii == 0) {
            hh++
        }
        return x
    }
    return gerarTodasAsHoras().map((hora) => {
        return extrairHoras(labelsReais).includes(hora) ? Addii() : Addhora(hora);
    });
}

function gerarTodasAsHoras() {
    const horas = [];
    for (let i = 0; i < 24; i++) {
        horas.push(`${i.toString().padStart(2, '0')}:00:00`); // Formata no formato "HH:00"
    }
    return horas;
}

function preencherMesesFaltantes(MesesReais) {
    hh = 0
    ii = 0

    function Addii() {
        ii++
        return MesesReais[ii - 1]
    }

    function Addhora(x) {
        if (ii == 0) {
            hh++
        }
        return x
    }

    return gerarTodasOsMeses().map((hora) => {
        return extrairMeses(MesesReais).includes(hora) ? Addii() : Addhora(hora);
    });
}

function gerarTodasOsMeses() {
    const Meses = [];
    for (let i = 1; i <= 12; i++) {
        Meses.push(`2024-${i.toString().padStart(2, '0')}-00`); // Formata no formato "HH:00"
    }
    return Meses;
}

function gerarTodasOsDias(mes = '00', ano = '0000') {
    const Meses = [];
    for (let i = 1; i <= new Date(ano, mes, 0).getDate(); i++) {
        Meses.push(`${ano}-${mes}-${i.toString().padStart(2, '0')}`); // Formata no formato "HH:00"
    }
    return Meses;
}

function extrairMeses(labelsReais) {
    return labelsReais.map(label => {
        return '2024-' + label.split('-')[1] + '-00';
    })
}

function changeGrafico(T) {

    switch (T) {
        case '1':
            dataLine.data.labels = preencherHorasFaltantes(DadosDeHoje.datas);
            dataLine.data.datasets[0].data = preencherUmidadeEChuvaFaltantes(DadosDeHoje.datas, DadosDeHoje.umidades)
            dataLine.data.datasets[1].data = preencherUmidadeEChuvaFaltantes(DadosDeHoje.datas, DadosDeHoje.chuvas)
            break;
        case '2':
            dataLine.data.labels = gerarTodasOsDias(DadosDoMes.UltimoMes, DadosDoMes.UltimoAno)
            dataLine.data.datasets[0].data = preencherUmidadeEChuvaFaltantesDia(DadosDoMes.datas, DadosDoMes.umidades)
            dataLine.data.datasets[1].data = preencherUmidadeEChuvaFaltantesDia(DadosDoMes.datas, DadosDoMes.chuvas)
            break;
        case '3':
            dataLine.data.labels = preencherMesesFaltantes(DadosDoMes.datas)
            dataLine.data.datasets[0].data = preencherUmidadeEChuvaFaltantesMes(DadosDoMes.datas, DadosDoMes.umidades)
            dataLine.data.datasets[1].data = preencherUmidadeEChuvaFaltantesMes(DadosDoMes.datas, DadosDoMes.chuvas)
            break;
    }

    myChart.data.datasets = dataLine.data.datasets;
    myChart.data.labels = dataLine.data.labels;
    myChart.update()
}
 setInterval(function(){
    dados = AtualizaData();
    let cacheLest = dados.dados_segundos[dados.dados_segundos.length - 1]
    $('#ultimaHora').text(cacheLest.Data)
    $('#Umidade').text(cacheLest.Umidade+"%")
    $('#ultimaChuva').text(cacheLest.Chuva)

    TabelaUltimosLançamentos()
 },5000)