      // Player object
        let player = {
            name: "Per",
            chips: 200,
        };

        // Game state variables
        let cards = [];
        let dealerCards = [];
        let sum = 0;
        let dealerSum = 0;
        let hasBlackJack = false;
        let isAlive = false;
        let gameOver = false;
        let currentBet = 0;
        let message = "";

        // DOM elements
        let messageEl = document.getElementById("message-el");
        let sumEl = document.getElementById("sum-el");
        let cardsEl = document.getElementById("cards-el");
        let playerEl = document.getElementById("player-el");
        let dealerCardsEl = document.getElementById("dealer-cards");
        let resultEl = document.getElementById("result-el");
        let betInput = document.getElementById("bet-input");
        let hitBtn = document.getElementById("hit-btn");
        let standBtn = document.getElementById("stand-btn");

        // Update player display
        playerEl.textContent = player.name + ": $" + player.chips;

        // Get random card
        function getRandomCard() {
            let randomNumber = Math.floor(Math.random() * 13) + 1;
            if (randomNumber === 1) {
                return 11;
            } else if (randomNumber > 10) {
                return 10;
            }
            return randomNumber;
        }

        // Calculate hand value (handle Aces)
        function calculateSum(hand) {
            let total = 0;
            let aces = 0;

            for (let i = 0; i < hand.length; i++) {
                total += hand[i];
                if (hand[i] === 11) {
                    aces += 1;
                }
            }

            // Adjust for Aces
            while (total > 21 && aces > 0) {
                total -= 10;
                aces -= 1;
            }

            return total;
        }

        // Start new game
        function startGame() {
            // Get bet amount
            currentBet = parseInt(betInput.value);
            
            if (currentBet > player.chips) {
                alert("You don't have enough chips!");
                return;
            }

            if (currentBet < 10) {
                alert("Minimum bet is $10!");
                return;
            }

            // Reset game
            isAlive = true;
            gameOver = false;
            hasBlackJack = false;
            resultEl.textContent = "";
            resultEl.className = "";
            
            // Deal cards
            let firstCard = getRandomCard();
            let secondCard = getRandomCard();
            cards = [firstCard, secondCard];
            sum = calculateSum(cards);
            
            // Dealer gets 2 cards (one hidden)
            let dealerFirstCard = getRandomCard();
            let dealerSecondCard = getRandomCard();
            dealerCards = [dealerFirstCard, dealerSecondCard];
            dealerSum = calculateSum(dealerCards);
            
            // Show only dealer's first card
            dealerCardsEl.textContent = "🂠 " + dealerFirstCard;
            
            // Enable buttons
            hitBtn.disabled = false;
            standBtn.disabled = false;
            
            renderGame();
            
            // Check for immediate blackjack
            if (sum === 21) {
                hasBlackJack = true;
                stand();
            }
        }

        // Render game state
        function renderGame() {
            cardsEl.textContent = "Cards: ";

            for (let i = 0; i < cards.length; i++) {
                cardsEl.textContent += cards[i] + " ";
            }

            sumEl.textContent = "Sum: " + sum;
            
            if (sum <= 20) {
                message = "Do you want to draw a new card?";
            } else if (sum === 21) {
                message = "Wohoo! You've got Blackjack!";
                hasBlackJack = true;
            } else {
                message = "You're out of the game!";
                isAlive = false;
            }
            
            messageEl.textContent = message;
        }

        // Hit - draw new card
        function newCard() {
            if (isAlive === true && hasBlackJack === false && gameOver === false) {
                let card = getRandomCard();
                cards.push(card);
                sum = calculateSum(cards);
                renderGame();
                
                // Auto stand if bust
                if (sum > 21) {
                    stand();
                }
            }
        }

        // Stand - dealer's turn
        function stand() {
            if (!isAlive && !hasBlackJack) {
                return;
            }
            
            gameOver = true;
            hitBtn.disabled = true;
            standBtn.disabled = true;
            
            // Show dealer's full hand
            dealerCardsEl.textContent = "Cards: ";
            for (let i = 0; i < dealerCards.length; i++) {
                dealerCardsEl.textContent += dealerCards[i] + " ";
            }
            
            // Dealer draws until 17 or higher
            while (dealerSum < 17) {
                let newCard = getRandomCard();
                dealerCards.push(newCard);
                dealerSum = calculateSum(dealerCards);
                dealerCardsEl.textContent += newCard + " ";
            }
            
            // Determine winner
            determineWinner();
        }

        // Determine winner and update chips
        function determineWinner() {
            let resultMessage = "";
            let resultClass = "";
            
            if (sum > 21) {
                // Player busts
                resultMessage = "💥 BUST! You lose $" + currentBet;
                resultClass = "lose";
                player.chips -= currentBet;
            } else if (dealerSum > 21) {
                // Dealer busts
                resultMessage = "🎉 Dealer BUSTS! You win $" + currentBet;
                resultClass = "win";
                player.chips += currentBet;
            } else if (sum > dealerSum) {
                // Player wins
                resultMessage = "🏆 YOU WIN! +$" + currentBet;
                resultClass = "win";
                player.chips += currentBet;
            } else if (sum < dealerSum) {
                // Dealer wins
                resultMessage = "😔 Dealer wins! -$" + currentBet;
                resultClass = "lose";
                player.chips -= currentBet;
            } else {
                // Push (tie)
                resultMessage = "🤝 PUSH! Bet returned";
                resultClass = "push";
            }
            
            // Special case: Blackjack pays 3:2
            if (hasBlackJack && sum === 21 && dealerSum !== 21) {
                let winnings = Math.floor(currentBet * 1.5);
                resultMessage = " BLACKJACK! You win $" + winnings;
                player.chips += winnings;
            }
            
            // Update display
            resultEl.textContent = resultMessage;
            resultEl.className = "result-message " + resultClass;
            playerEl.textContent = player.name + ": $" + player.chips;
            
            // Check if player is out of money
            if (player.chips < 10) {
                setTimeout(function() {
                    alert("You're out of chips! Game Over!");
                    player.chips = 200;
                    playerEl.textContent = player.name + ": $" + player.chips;
                }, 1000);
            }
        }