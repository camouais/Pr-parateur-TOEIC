src="https://cdn.jsdelivr.net/npm/chart.js"
// Initialisation du stockage local
if (!localStorage.getItem('toeicVocab')) {
    localStorage.setItem('toeicVocab', JSON.stringify([]));
}
if (!localStorage.getItem('toeicScores')) {
    localStorage.setItem('toeicScores', JSON.stringify([]));
}
if (!localStorage.getItem('toeicTargetScore')) {
    localStorage.setItem('toeicTargetScore', '750');
}
if (!localStorage.getItem('toeicWordStats')) {
    localStorage.setItem('toeicWordStats', JSON.stringify({}));
}

// Éléments DOM
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Gestion des onglets
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Supprimer la classe active de tous les boutons
        tabButtons.forEach(btn => {
            btn.classList.remove('active', 'text-blue-600', 'border-blue-600');
            btn.classList.add('text-gray-500');
        });
        
        // Ajouter la classe active au bouton cliqué
        button.classList.add('active', 'text-blue-600', 'border-blue-600');
        button.classList.remove('text-gray-500');
        
        // Masquer tous les contenus d'onglet
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        
        // Afficher le contenu de l'onglet correspondant
        const tabId = button.id.replace('tab-', '');
        document.getElementById(`${tabId}-content`).classList.remove('hidden');
        
        // Si c'est l'onglet Progression, mettre à jour les graphiques
        if (tabId === 'progress') {
            updateProgressCharts();
        }
    });
});

// Fonction pour afficher une notification toast
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `fixed top-4 right-4 text-white px-4 py-2 rounded shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 500);
    }, 3000);
}

// ==================== VOCABULAIRE ====================
const addWordBtn = document.getElementById('add-word-btn');
const newWordInput = document.getElementById('new-word');
const newTranslationInput = document.getElementById('new-translation');
const newCategorySelect = document.getElementById('new-category');
const vocabList = document.getElementById('vocab-list');
const searchVocabInput = document.getElementById('search-vocab');
const clearSearchBtn = document.getElementById('clear-search');
const filterCategorySelect = document.getElementById('filter-category');

// Ajouter un nouveau mot
addWordBtn.addEventListener('click', () => {
    const word = newWordInput.value.trim();
    const translation = newTranslationInput.value.trim();
    const category = newCategorySelect.value;
    
    if (word && translation) {
        const vocab = JSON.parse(localStorage.getItem('toeicVocab'));
        vocab.push({ word, translation, category });
        localStorage.setItem('toeicVocab', JSON.stringify(vocab));
        
        newWordInput.value = '';
        newTranslationInput.value = '';
        
        renderVocabList();
        showToast('Mot ajouté avec succès!');
    } else {
        showToast('Veuillez remplir tous les champs', 'error');
    }
});

// Rendre la liste de vocabulaire
function renderVocabList() {
    const vocab = JSON.parse(localStorage.getItem('toeicVocab'));
    const searchTerm = searchVocabInput.value.toLowerCase();
    const filterCategory = filterCategorySelect.value;
    
    let filteredVocab = vocab;
    
    // Filtrer par recherche
    if (searchTerm) {
        filteredVocab = filteredVocab.filter(item => 
            item.word.toLowerCase().includes(searchTerm) || 
            item.translation.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrer par catégorie
    if (filterCategory !== 'all') {
        filteredVocab = filteredVocab.filter(item => item.category === filterCategory);
    }
    
    vocabList.innerHTML = '';
    
    if (filteredVocab.length === 0) {
        vocabList.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-4">Aucun mot trouvé</p>';
        return;
    }
    
    filteredVocab.forEach((item, index) => {
        const wordCard = document.createElement('div');
        wordCard.className = 'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden';
        wordCard.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg text-blue-800">${item.word}</h3>
                        <p class="text-gray-600">${item.translation}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}">${getCategoryLabel(item.category)}</span>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 flex justify-between">
                <button class="edit-word-btn text-blue-600 hover:text-blue-800" data-index="${index}">
                    <i class="fas fa-edit mr-1"></i> Modifier
                </button>
                <button class="delete-word-btn text-red-600 hover:text-red-800" data-index="${index}">
                    <i class="fas fa-trash mr-1"></i> Supprimer
                </button>
            </div>
        `;
        vocabList.appendChild(wordCard);
    });
    
    // Ajouter des écouteurs pour les boutons de suppression et d'édition
    document.querySelectorAll('.delete-word-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            deleteWord(index);
        });
    });
    
    document.querySelectorAll('.edit-word-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            editWord(index);
        });
    });
}

// Obtenir la couleur de la catégorie
function getCategoryColor(category) {
    const colors = {
        'general': 'bg-blue-100 text-blue-800',
        'business': 'bg-purple-100 text-purple-800',
        'travel': 'bg-green-100 text-green-800',
        'technology': 'bg-orange-100 text-orange-800',
        'health': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
}

// Obtenir le libellé de la catégorie
function getCategoryLabel(category) {
    const labels = {
        'general': 'Général',
        'business': 'Business',
        'travel': 'Voyage',
        'technology': 'Technologie',
        'health': 'Santé'
    };
    return labels[category] || category;
}

// Supprimer un mot
function deleteWord(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mot?')) {
        const vocab = JSON.parse(localStorage.getItem('toeicVocab'));
        vocab.splice(index, 1);
        localStorage.setItem('toeicVocab', JSON.stringify(vocab));
        renderVocabList();
        showToast('Mot supprimé avec succès!');
    }
}

// Modifier un mot
function editWord(index) {
    const vocab = JSON.parse(localStorage.getItem('toeicVocab'));
    const word = vocab[index];
    
    newWordInput.value = word.word;
    newTranslationInput.value = word.translation;
    newCategorySelect.value = word.category;
    
    // Supprimer le mot pour le remplacer par la version modifiée
    vocab.splice(index, 1);
    localStorage.setItem('toeicVocab', JSON.stringify(vocab));
    
    // Déplacer le curseur vers le haut pour voir le formulaire
    window.scrollTo(0, 0);
    newWordInput.focus();
    
    showToast('Modifiez le mot et cliquez sur Ajouter pour enregistrer', 'info');
}

// Recherche de vocabulaire
searchVocabInput.addEventListener('input', renderVocabList);
clearSearchBtn.addEventListener('click', () => {
    searchVocabInput.value = '';
    renderVocabList();
});
filterCategorySelect.addEventListener('change', renderVocabList);

// ==================== SCORES ====================
const addScoreBtn = document.getElementById('add-score-btn');
const testDateInput = document.getElementById('test-date');
const listeningScoreInput = document.getElementById('listening-score');
const readingScoreInput = document.getElementById('reading-score');
const scoresList = document.getElementById('scores-list');

// Définir la date d'aujourd'hui par défaut
testDateInput.valueAsDate = new Date();

// Ajouter un nouveau score
addScoreBtn.addEventListener('click', () => {
    const date = testDateInput.value;
    const listening = parseInt(listeningScoreInput.value);
    const reading = parseInt(readingScoreInput.value);
    
    if (date && !isNaN(listening) && !isNaN(reading)) {
        const scores = JSON.parse(localStorage.getItem('toeicScores'));
        scores.push({ date, listening, reading });
        localStorage.setItem('toeicScores', JSON.stringify(scores));
        
        // Réinitialiser les champs
        testDateInput.valueAsDate = new Date();
        listeningScoreInput.value = '';
        readingScoreInput.value = '';
        
        renderScoresList();
        showToast('Score enregistré avec succès!');
    } else {
        showToast('Veuillez remplir tous les champs correctement', 'error');
    }
});

// Rendre la liste des scores
function renderScoresList() {
    const scores = JSON.parse(localStorage.getItem('toeicScores'));
    
    // Trier par date (du plus récent au plus ancien)
    scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    scoresList.innerHTML = '';
    
    if (scores.length === 0) {
        scoresList.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-500">Aucun score enregistré</td>
            </tr>
        `;
        return;
    }
    
    scores.forEach((score, index) => {
        const total = score.listening + score.reading;
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="py-2 px-4 border-b border-gray-200">${formatDate(score.date)}</td>
            <td class="py-2 px-4 border-b border-gray-200">${score.listening}</td>
            <td class="py-2 px-4 border-b border-gray-200">${score.reading}</td>
            <td class="py-2 px-4 border-b border-gray-200 font-medium">${total}</td>
            <td class="py-2 px-4 border-b border-gray-200">
                <button class="delete-score-btn text-red-600 hover:text-red-800" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        scoresList.appendChild(row);
    });
    
    // Ajouter des écouteurs pour les boutons de suppression
    document.querySelectorAll('.delete-score-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            deleteScore(index);
        });
    });
}

// Formater la date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Supprimer un score
function deleteScore(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce score?')) {
        const scores = JSON.parse(localStorage.getItem('toeicScores'));
        scores.splice(index, 1);
        localStorage.setItem('toeicScores', JSON.stringify(scores));
        renderScoresList();
        showToast('Score supprimé avec succès!');
    }
}

// ==================== EXERCICES ====================
const startExerciseBtn = document.getElementById('start-exercise');
const resetExerciseBtn = document.getElementById('reset-exercise');
const exerciseContainer = document.getElementById('exercise-container');
const flashcard = document.getElementById('flashcard');
const cardWord = document.getElementById('card-word');
const cardTranslation = document.getElementById('card-translation');
const knowBtn = document.getElementById('know-btn');
const dontKnowBtn = document.getElementById('dont-know-btn');
const exerciseProgress = document.getElementById('exercise-progress');
const exerciseScore = document.getElementById('exercise-score');
const exerciseProgressBar = document.getElementById('exercise-progress-bar');
const exerciseResults = document.getElementById('exercise-results');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');
const totalCount = document.getElementById('total-count');
const percentageScore = document.getElementById('percentage-score');
const resultsProgressBar = document.getElementById('results-progress-bar');

let currentExercise = [];
let currentIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let isFlipped = false;

// Commencer un exercice
startExerciseBtn.addEventListener('click', () => {
    const vocab = JSON.parse(localStorage.getItem('toeicVocab'));
    
    if (vocab.length === 0) {
        showToast('Ajoutez d\'abord des mots à votre vocabulaire', 'error');
        return;
    }
    
    // Mélanger le vocabulaire
    currentExercise = [...vocab].sort(() => Math.random() - 0.5);
    currentIndex = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    
    // Afficher l'interface d'exercice
    startExerciseBtn.classList.add('hidden');
    resetExerciseBtn.classList.remove('hidden');
    exerciseContainer.classList.remove('hidden');
    exerciseResults.classList.add('hidden');
    
    // Afficher la première carte
    updateExerciseCard();
});

// Réinitialiser l'exercice
resetExerciseBtn.addEventListener('click', () => {
    startExerciseBtn.classList.remove('hidden');
    resetExerciseBtn.classList.add('hidden');
    exerciseContainer.classList.add('hidden');
    exerciseResults.classList.add('hidden');
    flashcard.classList.remove('flipped');
    isFlipped = false;
});

// Mettre à jour la carte d'exercice
function updateExerciseCard() {
    if (currentIndex >= currentExercise.length) {
        endExercise();
        return;
    }
    
    const currentCard = currentExercise[currentIndex];
    cardWord.textContent = currentCard.word;
    cardTranslation.textContent = currentCard.translation;
    
    // Réinitialiser l'état de la carte
    if (isFlipped) {
        flashcard.classList.remove('flipped');
        isFlipped = false;
    }
    
    // Mettre à jour la progression
    exerciseProgress.textContent = `${currentIndex + 1}/${currentExercise.length}`;
    exerciseScore.textContent = `Score: ${correctAnswers}`;
    const progressPercent = ((currentIndex) / currentExercise.length) * 100;
    exerciseProgressBar.style.width = `${progressPercent}%`;
    
    // Afficher les boutons de réponse seulement après le premier clic
    knowBtn.classList.add('hidden');
    dontKnowBtn.classList.add('hidden');
}

// Gérer le clic sur la carte
flashcard.addEventListener('click', () => {
    if (currentExercise.length === 0) return;
    
    if (!isFlipped) {
        flashcard.classList.add('flipped');
        isFlipped = true;
        
        // Afficher les boutons de réponse
        knowBtn.classList.remove('hidden');
        dontKnowBtn.classList.remove('hidden');
    }
});

// Gérer les réponses
knowBtn.addEventListener('click', () => {
    if (!isFlipped) return;
    
    correctAnswers++;
    updateWordStat(currentExercise[currentIndex].word, true);
    nextCard();
});

dontKnowBtn.addEventListener('click', () => {
    if (!isFlipped) return;
    
    incorrectAnswers++;
    updateWordStat(currentExercise[currentIndex].word, false);
    nextCard();
});

// Passer à la carte suivante
function nextCard() {
    currentIndex++;
    updateExerciseCard();
}

// Terminer l'exercice
function endExercise() {
    exerciseContainer.classList.add('hidden');
    exerciseResults.classList.remove('hidden');
    
    const total = correctAnswers + incorrectAnswers;
    const percent = Math.round((correctAnswers / total) * 100);
    
    correctCount.textContent = correctAnswers;
    incorrectCount.textContent = incorrectAnswers;
    totalCount.textContent = total;
    percentageScore.textContent = `${percent}%`;
    resultsProgressBar.style.width = `${percent}%`;
    
    // Changer la couleur de la barre en fonction du score
    if (percent < 50) {
        resultsProgressBar.className = 'progress-bar bg-red-500 h-4 rounded-full';
    } else if (percent < 75) {
        resultsProgressBar.className = 'progress-bar bg-yellow-500 h-4 rounded-full';
    } else {
        resultsProgressBar.className = 'progress-bar bg-green-500 h-4 rounded-full';
    }
}

// Mettre à jour les statistiques des mots
function updateWordStat(word, known) {
    const stats = JSON.parse(localStorage.getItem('toeicWordStats'));
    
    if (!stats[word]) {
        stats[word] = { attempts: 0, correct: 0 };
    }
    
    stats[word].attempts++;
    if (known) {
        stats[word].correct++;
    }
    
    localStorage.setItem('toeicWordStats', JSON.stringify(stats));
}

// ==================== PROGRESSION ====================
const targetScoreInput = document.getElementById('target-score-input');
const setTargetScoreBtn = document.getElementById('set-target-score');
const targetScoreDisplay = document.getElementById('target-score-display');
const targetScoreBar = document.getElementById('target-score-bar');
const learnedWordsCount = document.getElementById('learned-words-count');
const learnedWordsBar = document.getElementById('learned-words-bar');
const reviewWordsCount = document.getElementById('review-words-count');
const reviewWordsBar = document.getElementById('review-words-bar');

// Définir le score cible
setTargetScoreBtn.addEventListener('click', () => {
    const targetScore = parseInt(targetScoreInput.value);
    
    if (!isNaN(targetScore) && targetScore >= 10 && targetScore <= 990) {
        localStorage.setItem('toeicTargetScore', targetScore.toString());
        updateProgressCharts();
        showToast(`Score cible défini à ${targetScore}`);
    } else {
        showToast('Veuillez entrer un score entre 10 et 990', 'error');
    }
});

// Mettre à jour les graphiques de progression
function updateProgressCharts() {
    // Score cible
    const targetScore = parseInt(localStorage.getItem('toeicTargetScore')) || 750;
    targetScoreInput.value = targetScore;
    
    // Dernier score
    const scores = JSON.parse(localStorage.getItem('toeicScores'));
    const lastScore = scores.length > 0 ? 
        scores[scores.length - 1].listening + scores[scores.length - 1].reading : 
        0;
    
    targetScoreDisplay.textContent = `${lastScore}/${targetScore}`;
    const targetPercent = Math.min(100, (lastScore / targetScore) * 100);
    targetScoreBar.style.width = `${targetPercent}%`;
    
    // Statistiques des mots
    const stats = JSON.parse(localStorage.getItem('toeicWordStats'));
    const vocab = JSON.parse(localStorage.getItem('toeicVocab'));
    
    let learnedWords = 0;
    let reviewWords = 0;
    
    vocab.forEach(word => {
        if (stats[word.word]) {
            const successRate = stats[word.word].correct / stats[word.word].attempts;
            if (successRate >= 0.8) {
                learnedWords++;
            } else {
                reviewWords++;
            }
        }
    });
    
    const totalWords = vocab.length;
    const learnedPercent = totalWords > 0 ? (learnedWords / totalWords) * 100 : 0;
    const reviewPercent = totalWords > 0 ? (reviewWords / totalWords) * 100 : 0;
    
    learnedWordsCount.textContent = `${learnedWords}/${totalWords}`;
    learnedWordsBar.style.width = `${learnedPercent}%`;
    
    reviewWordsCount.textContent = `${reviewWords}/${totalWords}`;
    reviewWordsBar.style.width = `${reviewPercent}%`;
    
    // Graphique des scores
    updateScoresChart();
}

// Mettre à jour le graphique des scores
function updateScoresChart() {
    const scores = JSON.parse(localStorage.getItem('toeicScores')) || [];
    const targetScore = parseInt(localStorage.getItem('toeicTargetScore')) || 750;

    scores.sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = scores.map(score => new Date(score.date).toLocaleDateString('fr-FR'));
    const listening = scores.map(score => score.listening);
    const reading = scores.map(score => score.reading);
    const total = scores.map(score => score.listening + score.reading);
    const objectif = Array(scores.length).fill(targetScore);

    const ctx = document.getElementById('scores-chart').getContext('2d');

    // Détruire l'ancien graphique si existant
    if (window.scoresChart) {
        window.scoresChart.destroy();
    }

    window.scoresChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Listening',
                    data: listening,
                    borderColor: 'rgba(59,130,246,1)',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Reading',
                    data: reading,
                    borderColor: 'rgba(16,185,129,1)',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Total',
                    data: total,
                    borderColor: 'rgba(139,92,246,1)',
                    backgroundColor: 'rgba(139,92,246,0.1)',
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Objectif',
                    data: objectif,
                    borderColor: 'rgba(239,68,68,1)',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 990,
                    ticks: {
                        stepSize: 100
                    }
                }
            }
        }
    });
}


// Obtenir le niveau TOEIC
function getTOEICLevel(score) {
    if (score >= 905) return 'International Professional';
    if (score >= 785) return 'Working English Plus';
    if (score >= 605) return 'Working English';
    if (score >= 405) return 'Elementary Working English';
    if (score >= 255) return 'Basic English';
    return 'Beginner';
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    renderVocabList();
    renderScoresList();
    updateProgressCharts();
    
    // Définir le score cible initial
    targetScoreInput.value = localStorage.getItem('toeicTargetScore') || '750';
});