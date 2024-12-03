// Inicializando o Firebase e outras configurações
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyB9lDG5ncGjRyJ_YM1fUofvk6dvXBRFeKg",
    authDomain: "Ylensgeld-9df15.firebaseapp.com",
    databaseURL: "https://lensgeld-9df15-default-rtdb.firebaseio.com/",
    projectId: "lensgeld-9df15",
    storageBucket: "lensgeld-9df15.firebasestorage.app",
    messagingSenderId: "359787924372",
    appId: "1:359787924372:web:a1fc791f808e2cfa3a1d81",
    measurementId: "G-7JZ3FLX7LR"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
    // Referências aos elementos
    const btnGastos = document.getElementById('btn-gastos');
    const modalGastos = document.getElementById('modal-gastos');
    const closeModalGastos = document.getElementById('close-modal-gastos');
    const btnValor = document.getElementById('btn-salvar');
    const modalValor = document.getElementById('modal-valor');
    const closeModalValor = document.getElementById('close-modal-valor');
    
    carregarGastos();  // Chamada correta para carregar os gastos

    // Função para adicionar um gasto
    async function addExpense() {
        const nome = document.getElementById('product-name').value;
        const valor = parseFloat(document.getElementById('product-price').value);
        const cor = document.getElementById('color-picker').value;
        
        if (!nome || !valor) {
            alert('Por favor, insira um nome e valor válidos para o gasto.');
            return;
        }

        const novoGasto = { nome, valor, cor };

        try {
            const gastoRef = doc(collection(db, 'gastos'));
            await setDoc(gastoRef, novoGasto);
            console.log('Gasto salvo com sucesso!');
            carregarGastos();  // Recarregar a tabela de gastos
        } catch (error) {
            console.error('Erro ao adicionar gasto: ', error);
        }
    }

   // Função para carregar os gastos do Firebase
async function carregarGastos() {
    const gastosSnapshot = await getDocs(collection(db, 'gastos'));
    const gastos = gastosSnapshot.docs.map(doc => doc.data());
    console.log(gastos);

    // Atualiza a tabela com os gastos
    const tableBody = document.querySelector('#expenses-table tbody');
    tableBody.innerHTML = '';  // Limpa a tabela antes de inserir os dados

    gastos.forEach(gasto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${gasto.nome}</td>
            <td>R$${gasto.valor.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });

    updateChart(gastos);  // Atualizar o gráfico com os novos dados
}

// Função para atualizar o gráfico
function updateChart(gastos) {
    const totalMoney = parseFloat(document.getElementById("total-money").value);
    if (isNaN(totalMoney) || totalMoney <= 0) {
        alert("Por favor, insira um valor válido para a receita!");
        return;
    }

    const expenseNames = gastos.map(gasto => gasto.nome);
    const expenseValues = gastos.map(gasto => gasto.valor);
    const remainingMoney = totalMoney - expenseValues.reduce((a, b) => a + b, 0);

    const chartData = {
        labels: [...expenseNames, "Restante"],
        datasets: [{
            data: [...expenseValues, remainingMoney],
            backgroundColor: [...expenseValues.map(() => 'rgba(255, 99, 132, 0.2)'), 'rgba(75, 192, 192, 0.2)'],
            borderColor: [...expenseValues.map(() => 'rgba(255, 99, 132, 1)'), 'rgba(75, 192, 192, 1)'],
            borderWidth: 1
        }]
    };

    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    // Verificar se o gráfico já existe
    if (window.expenseChart) {
        window.expenseChart.destroy();  // Destruir o gráfico existente antes de criar um novo
    }

    console.log("Criando ou atualizando o gráfico...");
    window.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Distribuição de Gastos no Mês' }
            }
        }
    });
}

    // Funções para abrir e fechar modais
    btnGastos.addEventListener('click', () => modalGastos.classList.add('show'));
    closeModalGastos.addEventListener('click', () => modalGastos.classList.remove('show'));
    btnValor.addEventListener('click', () => modalValor.classList.add('show'));
    closeModalValor.addEventListener('click', () => modalValor.classList.remove('show'));

    // Controle para o menu lateral
    const menu = document.querySelector('#menu-icon');
    const sidenavbar = document.querySelector('.side-navbar');
    const content = document.querySelector('.content');
    menu.onclick = () => {
        sidenavbar.classList.toggle('active');
        content.classList.toggle('active');
    };

    async function adicionarGasto(nome, cor, recorrente, frequencia, dataRecorrencia, valor = 0) {
        // Pega a cor escolhida ou usa a cor padrão
        const corSelecionada = cor || getComputedStyle(document.documentElement).getPropertyValue('--cor-padrao').trim(); // --cor-padrao é a variável no seu CSS
        
        const novoGasto = {
            nome,
            valor, // Usando o valor passado como argumento
            cor: corSelecionada, // A cor escolhida ou a padrão
            recorrente: { ativo: recorrente, frequencia, dataRecorrencia }
        };
    
        try {
            const gastoRef = doc(collection(db, "gastosPreDefinidos"));
            await setDoc(gastoRef, novoGasto);
            console.log("Gasto salvo no Firebase com sucesso!");
            carregarGastos();  // Recarrega os gastos após salvar
        } catch (error) {
            console.error("Erro ao salvar gasto no Firebase: ", error);
        }
    }

    console.log("Script carregado com sucesso.");
});
