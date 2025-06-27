const CARD_TYPES = ['heart', 'diamond', 'club', 'spade'];
const CARD_VALUES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

Page({
    data: {
        cards: [], // 当前玩家的牌
        leftCards: [], // 左边电脑的牌
        rightCards: [], // 右边电脑的牌
        landlordCards: [], // 地主牌
        gameStatus: 'waiting', // waiting, dealing, playing, ended
        currentPlayer: 'player', // player, left, right
        audioEnabled: true // 音效开关
    },

    onLoad() {
        this.initGame();
    },

    // 初始化游戏
    initGame() {
        const deck = this.createDeck();
        const shuffled = this.shuffleDeck(deck);
        const [playerCards, leftCards, rightCards, landlord] = this.dealCards(shuffled);

        this.setData({
            cards: playerCards,
            landlordCards: landlord,
            gameStatus: 'dealing'
        });
    },

    // 创建一副牌
    createDeck() {
        let deck = [];
        // 添加普通牌
        CARD_TYPES.forEach(type => {
            CARD_VALUES.forEach(value => {
                deck.push({ type, value });
            });
        });
        // 添加大小王
        deck.push({ type: 'joker', value: 'black' });
        deck.push({ type: 'joker', value: 'red' });
        return deck;
    },

    // 洗牌
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    },

    // 发牌
    dealCards(deck) {
        const playerCards = deck.slice(0, 17);
        const leftCards = deck.slice(17, 34);
        const rightCards = deck.slice(34, 51);
        const landlordCards = deck.slice(51, 54);
        return [playerCards, leftCards, rightCards, landlordCards];
    },

    // 开始游戏
    startGame() {
        this.setData({
            gameStatus: 'playing'
        });
        this.playSound('start');
    },

    // 比较牌型大小
    compareCards(current, last) {
        // 王炸最大
        if (current.pattern === this.CARD_PATTERNS.KING_BOMB) return true;
        if (last.pattern === this.CARD_PATTERNS.KING_BOMB) return false;

        // 炸弹比其他牌型大
        if (current.pattern === this.CARD_PATTERNS.BOMB &&
            last.pattern !== this.CARD_PATTERNS.BOMB) return true;
        if (last.pattern === this.CARD_PATTERNS.BOMB &&
            current.pattern !== this.CARD_PATTERNS.BOMB) return false;

        // 同类型比较
        if (current.pattern === last.pattern &&
            current.value !== last.value &&
            current.cards.length === last.cards.length) {
            return CARD_VALUES.indexOf(current.value) > CARD_VALUES.indexOf(last.value);
        }

        return false;
    },

    // 出牌
    playCards(e) {
        const selected = e.currentTarget.dataset.cards;
        const validation = this.validateCards(selected);

        if (!validation.valid) {
            wx.showToast({
                title: '不合法的牌型',
                icon: 'none'
            });
            return;
        }

        // 如果是首出或比上家大
        if (!this.data.lastPlay || this.compareCards({
            pattern: validation.pattern,
            value: validation.value,
            cards: selected
        }, this.data.lastPlay)) {
            // 更新游戏状态
            this.setData({
                lastPlay: {
                    pattern: validation.pattern,
                    value: validation.value,
                    cards: selected
                },
                cards: this.data.cards.filter(card =>
                    !selected.some(s => s.type === card.type && s.value === card.value)
                )
            });

            // 播放出牌音效
            this.playSound('play');

            // 检查是否出完牌
            if (this.data.cards.length === 0) {
                this.gameOver(true);
            } else {
                // 轮到下家
                this.nextPlayer();
            }
        } else {
            wx.showToast({
                title: '必须出比上家大的牌',
                icon: 'none'
            });
        }
    },

    // 游戏结束
    gameOver(isWinner) {
        this.setData({
            gameStatus: 'ended',
            gameResult: isWinner ? 'win' : 'lose'
        });

        // 播放胜利/失败音效
        this.playSound(isWinner ? 'win' : 'lose');

        wx.showModal({
            title: '游戏结束',
            content: isWinner ? '你赢了！' : '你输了！',
            showCancel: false
        });
    },

    // 轮到下家
    nextPlayer() {
        const players = ['player', 'left', 'right'];
        const currentIndex = players.indexOf(this.data.currentPlayer);
        this.setData({
            currentPlayer: players[(currentIndex + 1) % players.length]
        });

        // 如果是电脑玩家，自动出牌
        if (this.data.currentPlayer !== 'player') {
            setTimeout(() => this.computerPlay(), 1000);
        }
    },

    // 牌型枚举
    CARD_PATTERNS: {
        SINGLE: 'single',         // 单张
        PAIR: 'pair',             // 对子
        THREE: 'three',           // 三张
        THREE_WITH_ONE: 'three_with_one',       // 三带一
        THREE_WITH_PAIR: 'three_with_pair',     // 三带对
        STRAIGHT: 'straight',     // 顺子
        CONSECUTIVE_PAIRS: 'consecutive_pairs', // 连对
        AIRPLANE: 'airplane',     // 飞机
        BOMB: 'bomb',             // 炸弹
        KING_BOMB: 'king_bomb'    // 王炸
    },

    // 验证牌型
    validateCards(cards) {
        if (cards.length === 0) return false;

        // 按牌值排序
        const sorted = [...cards].sort((a, b) =>
            CARD_VALUES.indexOf(a.value) - CARD_VALUES.indexOf(b.value)
        );

        // 判断牌型
        switch (sorted.length) {
            case 1:
                return { valid: true, pattern: this.CARD_PATTERNS.SINGLE, value: sorted[0].value };

            case 2:
                // 对子或王炸
                if (sorted[0].value === sorted[1].value) {
                    return { valid: true, pattern: this.CARD_PATTERNS.PAIR, value: sorted[0].value };
                }
                if (sorted.every(c => c.type === 'joker')) {
                    return { valid: true, pattern: this.CARD_PATTERNS.KING_BOMB, value: 'joker' };
                }
                break;

            case 3:
                // 三张
                if (sorted[0].value === sorted[2].value) {
                    return { valid: true, pattern: this.CARD_PATTERNS.THREE, value: sorted[0].value };
                }
                break;

            case 4:
                // 炸弹或三带一
                if (sorted[0].value === sorted[3].value) {
                    return { valid: true, pattern: this.CARD_PATTERNS.BOMB, value: sorted[0].value };
                }
                // 检查三带一
                const threePart = this.findThreePart(sorted);
                if (threePart) {
                    return {
                        valid: true,
                        pattern: this.CARD_PATTERNS.THREE_WITH_ONE,
                        value: threePart.value
                    };
                }
                break;

            default:
                // 检查顺子、连对、飞机等复杂牌型
                if (this.isStraight(sorted)) {
                    return { valid: true, pattern: this.CARD_PATTERNS.STRAIGHT, value: sorted[0].value };
                }
                if (this.isConsecutivePairs(sorted)) {
                    return { valid: true, pattern: this.CARD_PATTERNS.CONSECUTIVE_PAIRS, value: sorted[0].value };
                }
                if (this.isAirplane(sorted)) {
                    return { valid: true, pattern: this.CARD_PATTERNS.AIRPLANE, value: sorted[0].value };
                }
        }

        return { valid: false };
    },

    // 辅助方法：找出三张相同的牌
    findThreePart(cards) {
        const valueCount = {};
        cards.forEach(card => {
            valueCount[card.value] = (valueCount[card.value] || 0) + 1;
        });

        for (const [value, count] of Object.entries(valueCount)) {
            if (count === 3) return { value };
        }
        return null;
    },

    // 判断是否为顺子
    isStraight(cards) {
        if (cards.length < 5 || cards.length > 12) return false;

        const values = [...new Set(cards.map(c => c.value))];
        if (values.length !== cards.length) return false;

        for (let i = 1; i < values.length; i++) {
            if (CARD_VALUES.indexOf(values[i]) - CARD_VALUES.indexOf(values[i - 1]) !== 1) {
                return false;
            }
        }
        return true;
    },

    // 判断是否为连对
    isConsecutivePairs(cards) {
        if (cards.length % 2 !== 0 || cards.length < 6) return false;

        const valueCount = {};
        cards.forEach(card => {
            valueCount[card.value] = (valueCount[card.value] || 0) + 1;
        });

        const pairs = Object.entries(valueCount).filter(([_, count]) => count === 2);
        if (pairs.length * 2 !== cards.length) return false;

        const sortedValues = pairs.map(([value]) => value).sort((a, b) =>
            CARD_VALUES.indexOf(a) - CARD_VALUES.indexOf(b)
        );

        for (let i = 1; i < sortedValues.length; i++) {
            if (CARD_VALUES.indexOf(sortedValues[i]) - CARD_VALUES.indexOf(sortedValues[i - 1]) !== 1) {
                return false;
            }
        }
        return true;
    },

    // 判断是否为飞机
    isAirplane(cards) {
        if (cards.length % 3 !== 0 && cards.length % 4 !== 0 && cards.length % 5 !== 0) return false;

        const valueCount = {};
        cards.forEach(card => {
            valueCount[card.value] = (valueCount[card.value] || 0) + 1;
        });

        // 找出所有三张
        const threes = Object.entries(valueCount)
            .filter(([_, count]) => count === 3)
            .map(([value]) => value)
            .sort((a, b) => CARD_VALUES.indexOf(a) - CARD_VALUES.indexOf(b));

        if (threes.length < 2) return false;

        // 检查连续的三张
        for (let i = 1; i < threes.length; i++) {
            if (CARD_VALUES.indexOf(threes[i]) - CARD_VALUES.indexOf(threes[i - 1]) !== 1) {
                return false;
            }
        }

        return true;
    },

    // 电脑出牌逻辑
    computerPlay() {
        // 获取电脑手牌（根据当前玩家决定是左边还是右边的电脑）
        const cards = this.data.currentPlayer === 'left'
            ? this.data.leftCards
            : this.data.rightCards;

        let play = null;

        // 1. 如果没有上家出牌，出最小的单张
        if (!this.data.lastPlay) {
            play = [cards[0]];
        }
        // 2. 如果有上家出牌，尝试出更大的同类型牌
        else {
            const possiblePlays = this.findPossiblePlays(cards, this.data.lastPlay);
            if (possiblePlays.length > 0) {
                // 简单策略：出最小的可行牌
                play = possiblePlays[0];
            }
        }

        if (play) {
            const validation = this.validateCards(play);

            // 更新游戏状态
            const updateData = {
                lastPlay: {
                    pattern: validation.pattern,
                    value: validation.value,
                    cards: play
                }
            };

            // 更新对应的电脑手牌
            if (this.data.currentPlayer === 'left') {
                updateData.leftCards = cards.filter(card =>
                    !play.some(p => p.type === card.type && p.value === card.value)
                );
            } else {
                updateData.rightCards = cards.filter(card =>
                    !play.some(p => p.type === card.type && p.value === card.value)
                );
            }

            this.setData(updateData);

            // 播放出牌音效
            this.playSound('play');

            // 检查是否出完牌
            if ((this.data.currentPlayer === 'left' && updateData.leftCards.length === 0) ||
                (this.data.currentPlayer === 'right' && updateData.rightCards.length === 0)) {
                this.gameOver(false);
            } else {
                this.nextPlayer();
            }
        } else {
            // 不出
            wx.showToast({
                title: '电脑选择不出',
                icon: 'none'
            });
            this.playSound('pass');
            this.nextPlayer();
        }
    },

    // 找出所有可能的出牌
    findPossiblePlays(cards, lastPlay) {
        const possible = [];
        const grouped = this.groupCardsByValue(cards);
        const cardValues = Object.keys(grouped).sort((a, b) =>
            CARD_VALUES.indexOf(a) - CARD_VALUES.indexOf(b)
        );

        // 根据上家牌型寻找可能的出牌
        switch (lastPlay.pattern) {
            case this.CARD_PATTERNS.SINGLE:
                // 找比上家大的单张
                for (const value of cardValues) {
                    if (CARD_VALUES.indexOf(value) > CARD_VALUES.indexOf(lastPlay.value)) {
                        possible.push([grouped[value][0]]);
                    }
                }
                break;

            case this.CARD_PATTERNS.PAIR:
                // 找比上家大的对子
                for (const value of cardValues) {
                    if (grouped[value].length >= 2 &&
                        CARD_VALUES.indexOf(value) > CARD_VALUES.indexOf(lastPlay.value)) {
                        possible.push(grouped[value].slice(0, 2));
                    }
                }
                break;

            case this.CARD_PATTERNS.THREE:
                // 找比上家大的三张
                for (const value of cardValues) {
                    if (grouped[value].length >= 3 &&
                        CARD_VALUES.indexOf(value) > CARD_VALUES.indexOf(lastPlay.value)) {
                        possible.push(grouped[value].slice(0, 3));
                    }
                }
                break;

            case this.CARD_PATTERNS.THREE_WITH_ONE:
                // 找比上家大的三带一
                for (const value of cardValues) {
                    if (grouped[value].length >= 3 &&
                        CARD_VALUES.indexOf(value) > CARD_VALUES.indexOf(lastPlay.value)) {
                        // 找一个单牌作为带牌
                        for (const otherValue of cardValues) {
                            if (otherValue !== value && grouped[otherValue].length >= 1) {
                                possible.push([
                                    ...grouped[value].slice(0, 3),
                                    grouped[otherValue][0]
                                ]);
                            }
                        }
                    }
                }
                break;

            case this.CARD_PATTERNS.BOMB:
                // 找比上家大的炸弹
                for (const value of cardValues) {
                    if (grouped[value].length >= 4 &&
                        CARD_VALUES.indexOf(value) > CARD_VALUES.indexOf(lastPlay.value)) {
                        possible.push(grouped[value].slice(0, 4));
                    }
                }
                break;
        }

        return possible;
    },

    // 按牌值分组
    groupCardsByValue(cards) {
        const groups = {};
        cards.forEach(card => {
            if (!groups[card.value]) groups[card.value] = [];
            groups[card.value].push(card);
        });
        return groups;
    },

    // 播放音效
    playSound(type) {
        if (!this.data.audioEnabled) return;

        const sounds = {
            'play': '/assets/sounds/play.mp3',
            'win': '/assets/sounds/win.mp3',
            'lose': '/assets/sounds/lose.mp3',
            'start': '/assets/sounds/start.mp3',
            'pass': '/assets/sounds/pass.mp3'
        };

        if (sounds[type]) {
            wx.playAudio({
                src: sounds[type]
            });
        }
    }
});