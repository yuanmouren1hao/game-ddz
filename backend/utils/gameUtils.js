// 扑克牌定义
const CARD_TYPES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const CARD_SUITS = ['♠', '♥', '♣', '♦'];
const SPECIAL_CARDS = ['小王', '大王'];

// 生成一副新牌
function createDeck() {
    const deck = [];

    // 添加普通牌
    for (const suit of CARD_SUITS) {
        for (const type of CARD_TYPES) {
            deck.push({
                suit,
                type,
                value: CARD_TYPES.indexOf(type),
                display: suit + type
            });
        }
    }

    // 添加大小王
    deck.push({
        type: '小王',
        value: 13,
        display: '小王'
    });
    deck.push({
        type: '大王',
        value: 14,
        display: '大王'
    });

    return deck;
}

// 洗牌
function shuffle() {
    const deck = createDeck();
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// 发牌
function dealCards(deck) {
    const hands = [[], [], []];
    const landlordCards = [];

    // 发牌给3个玩家
    for (let i = 0; i < 51; i++) {
        hands[i % 3].push(deck[i]);
    }

    // 地主牌
    for (let i = 51; i < 54; i++) {
        landlordCards.push(deck[i]);
    }

    // 按牌值排序
    for (const hand of hands) {
        hand.sort((a, b) => a.value - b.value);
    }

    return { hands, landlordCards };
}

// 牌型判断
function validateCardType(cards) {
    if (!cards || cards.length === 0) {
        return { isValid: false };
    }

    // TODO: 实现各种牌型判断
    // 单张、对子、三张、顺子、连对、飞机、炸弹、王炸等

    return { isValid: true, type: 'single' };
}

module.exports = {
    createDeck,
    shuffle,
    dealCards,
    validateCardType
};