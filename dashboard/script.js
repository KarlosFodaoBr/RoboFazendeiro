var ii = 0
var hh = 0

function AtualizaData() {
    let data = null;
    $.ajax({
        url: 'http://farmbotapi.elementfx.com/GETDATA.php',
        method: 'GET',
        dataType: 'json',
        async: false, // Torna a chamada síncrona
        success: function (response) {
            data = response;
        },
        error: function (xhr, status, error) {
            console.error('Error fetching data:', status, error);
        }
    });
    return data;
}

let dados = AtualizaData();

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
    VerificaSeEHj: function (DataVerificar) {
        let partesDataDia = DataVerificar.split(" ");
        let partesData = partesDataDia[0].split("-");
        let dataFormatada = partesData[1] + "/" + partesData[2] + "/" + partesData[0];
        return new Date().toDateString() === new Date(dataFormatada).toDateString();
    },
    filtrarPorHoje: function (dados) {
        let dadosHoje = {
            "dados_segundos": [],
            UltDiaCDados: null
        };

        ContDiario = dados.dados_segundos.some(item => PegaOsDadosDeHj.VerificaSeEHj(item.Data));

        if (ContDiario) {
            dados.dados_segundos.forEach(function (item) {
                if (PegaOsDadosDeHj.VerificaSeEHj(item.Data)) {
                    dadosHoje.dados_segundos.push(item);
                }
            })
        } else {
            dados.dados_segundos.forEach(function (item) {
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
    VerificaSeEMensal: function (DataVerificar) {
        let partesData = DataVerificar.split("-");
        let dataFormatada = partesData[1] + "/" + partesData[2] + "/" + partesData[0];
        return new Date(dataFormatada).getMonth() === new Date().getMonth() &&
            new Date(dataFormatada).getFullYear() === new Date().getFullYear()
    }, filtrarPorMes: function (dados) {

        let dadosHoje = {
            "medias_diarias": []
        };

        let Q = 0;
        let Menos = 0;


        function testaMes() {
            dados.medias_diarias.forEach(function (item) {
                if (PegaOsDadosMensais.VerificaSeEMensal(new Date(new Date(item.Data).setMonth(new Date(item.Data).getMonth() + Menos)).toISOString().split('T')[0])) {
                    Q++
                    dadosHoje.medias_diarias.push(item)
                }
            });
        }

        while (Q == 0 && Menos < 36) {
            Menos++
            testaMes()
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
    UltimoMes: null
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
            data: preencherUmidadeEChuvaFaltantes(DadosDeHoje.umidades),
            borderColor: "rgb(1, 151, 252)",
            backgroundColor: "rgb(34, 0, 255)",
            fill: false,
            cubicInterpolationMode: 'monotone', // Adiciona suavização
        },
        {
            label: "Chuva",
            data: preencherUmidadeEChuvaFaltantes(DadosDeHoje.chuvas),
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

function gerarTodasAsHoras() {
    const horas = [];
    for (let i = 0; i < 24; i++) {
        horas.push(`${i.toString().padStart(2, '0')}:00:00`); // Formata no formato "HH:00"
    }
    return horas;
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

function preencherUmidadeEChuvaFaltantes(arrr, fim = 24, inicio = hh) {
    arr = arrr.slice();
    for (let i = 0; i < inicio; i++) {
        arr.unshift(-1);
    }
    for (let i = arr[arr.length - 1] + 1; i <= fim; i++) {
        arr.push(-1);
    }
    console.log(arr, inicio, fim)
    return arr;
}
function gerarTodasOsMeses() {
    const Meses = [];
    for (let i = 1; i <= 12; i++) {
        Meses.push(`${i.toString().padStart(2, '0')}/0000`); // Formata no formato "HH:00"
    }
    return Meses;
}
function extrairMeses(labelsReais){
    return labelsReais.map(label => {
        // Extrai apenas a parte da hora, ignorando os minutos e segundos
        return label.split('/')[0] + '00/00/0000';
})
}

function changeGrafico(T) {

    switch (T) {
        case '1':
            dataLine.data.labels = preencherHorasFaltantes(DadosDeHoje.datas);
            dataLine.data.datasets[0].data = preencherUmidadeEChuvaFaltantes(DadosDeHoje.umidades)
            dataLine.data.datasets[1].data = preencherUmidadeEChuvaFaltantes(DadosDeHoje.chuvas)
            break;
        case '2':
            dataLine.data.labels = DadosDoMes.datas
            dataLine.data.datasets[0].data = DadosDoMes.umidades
            dataLine.data.datasets[1].data = DadosDoMes.chuvas
            break;
    }

    myChart.data.datasets = dataLine.data.datasets;
    myChart.data.labels = dataLine.data.labels;
    myChart.update()
}