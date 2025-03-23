// js/modules/card-animation.js

/**
 * カードアニメーション管理モジュール
 * 改良版：山札からのディールアニメーションを追加
 */
const CardAnimation = {
  /**
   * 山札の初期化
   */
  initDeck() {
    const deck = document.getElementById('card-deck');
    if (!deck) {
      console.error('カードデッキ要素が見つかりません');
      return;
    }
    
    // 山札を非表示に
    deck.classList.remove('active');
  },
  
  /**
   * 山札からカードを配る
   * @param {Array<HTMLElement>} cards - 配るカード要素の配列
   * @param {Object} options - オプション設定
   * @param {number} options.delay - カード間の遅延（ミリ秒）
   * @param {number} options.initialDelay - 最初のカードの遅延（ミリ秒）
   * @param {Function} options.onComplete - 配布完了時のコールバック
   */
  dealFromDeck(cards, options = {}) {
    if (!cards || !cards.length) return;
    
    const deck = document.getElementById('card-deck');
    if (!deck) {
      console.error('カードデッキ要素が見つかりません');
      return;
    }
    
    // デフォルト設定
    const settings = {
      delay: 300,
      initialDelay: 500,
      onComplete: null,
      ...options
    };
    
    // 元の位置を保存
    const originalPositions = cards.map(card => {
      const rect = card.getBoundingClientRect();
      return { 
        element: card,
        position: { 
          left: rect.left, 
          top: rect.top,
          width: rect.width,
          height: rect.height
        }
      };
    });
    
    // 山札を表示
    deck.classList.add('active');
    
    // 各カードを一時的に非表示
    cards.forEach(card => {
      card.style.opacity = '0';
    });
    
    // カードを1枚ずつ配る
    setTimeout(() => {
      let dealCount = 0;
      
      originalPositions.forEach((item, index) => {
        setTimeout(() => {
          const card = item.element;
          const pos = item.position;
          
          // 配布スタイルを追加
          card.classList.add('dealing');
          card.style.opacity = '1';
          
          // アニメーション完了時のイベント
          const onAnimationEnd = () => {
            card.removeEventListener('animationend', onAnimationEnd);
            card.classList.remove('dealing');
            
            // 元の位置に戻す
            card.style.position = '';
            card.style.top = '';
            card.style.left = '';
            card.style.transform = '';
            card.style.zIndex = '';
            
            dealCount++;
            
            // 全てのカードの配布が完了したら
            if (dealCount >= cards.length) {
              deck.classList.remove('active');
              
              if (settings.onComplete) {
                settings.onComplete();
              }
            }
          };
          
          card.addEventListener('animationend', onAnimationEnd);
          
          // アニメーションのカスタマイズ
          card.style.animationDuration = '0.8s';
          card.style.setProperty('--final-left', `${pos.left}px`);
          card.style.setProperty('--final-top', `${pos.top}px`);
          
        }, settings.delay * index);
      });
    }, settings.initialDelay);
  },
  
  /**
   * カードを裏返すアニメーション
   * @param {HTMLElement} card - カード要素
   * @param {boolean} isFront - 表面を表示するならtrue、裏面ならfalse
   * @param {Function} callback - アニメーション完了後のコールバック（オプション）
   */
  flipCard(card, isFront, callback) {
    // すでにアニメーション中であれば無視
    if (card.dataset.flipping === 'true') return;
    
    card.dataset.flipping = 'true';
    
    // 現在の状態と目標が同じなら何もしない
    const isCurrentlyFront = !card.classList.contains('flipped');
    if (isCurrentlyFront === isFront) {
      card.dataset.flipping = 'false';
      if (callback) callback();
      return;
    }
    
    // アニメーション追加
    card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // 裏返す
    if (isFront) {
      card.classList.remove('flipped');
    } else {
      card.classList.add('flipped');
    }
    
    // アニメーション完了後の処理
    const onAnimationEnd = () => {
      card.removeEventListener('transitionend', onAnimationEnd);
      card.dataset.flipping = 'false';
      if (callback) callback();
    };
    
    card.addEventListener('transitionend', onAnimationEnd);
  },
  
  /**
   * カードを揺らすアニメーション
   * @param {HTMLElement} card - カード要素
   */
  shakeCard(card) {
    card.classList.add('shake-animation');
    
    setTimeout(() => {
      card.classList.remove('shake-animation');
    }, 500);
  },
  
  /**
   * カードを強調表示するアニメーション
   * @param {HTMLElement} card - カード要素
   * @param {number} duration - 持続時間（ミリ秒）（オプション、デフォルト1000ms）
   */
  highlightCard(card, duration = 1000) {
    card.classList.add('highlight-animation');
    
    setTimeout(() => {
      card.classList.remove('highlight-animation');
    }, duration);
  },
  
  /**
   * カードを浮かせるアニメーション
   * @param {HTMLElement} card - カード要素
   * @param {boolean} isFloating - 浮かせる状態にする場合はtrue
   */
  floatCard(card, isFloating) {
    if (isFloating) {
      card.classList.add('float-animation');
    } else {
      card.classList.remove('float-animation');
    }
  },
  
  /**
   * フィールドカードをセットアップ
   * バックフェイスでカードが始まるようにする
   */
  setupFieldCards() {
    const fieldCards = document.querySelectorAll('.field-card');
    fieldCards.forEach(card => {
      // 初期状態で裏面を表示
      card.classList.add('flipped');
    });
  },
  
  /**
   * プレイヤーカードをセットアップ
   * 役職カードがスムーズに表示されるようにする
   * @param {HTMLElement} cardContainer - カードコンテナ要素
   */
  setupPlayerCard(cardContainer) {
    if (!cardContainer) return;
    
    const roleCard = cardContainer.querySelector('.my-role');
    if (roleCard) {
      // 初期状態は小さく透明
      roleCard.style.opacity = '0';
      roleCard.style.transform = 'scale(0.8)';
      
      // アニメーションで表示
      setTimeout(() => {
        roleCard.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        roleCard.style.opacity = '1';
        roleCard.style.transform = 'scale(1)';
      }, 300);
    }
  },
  
  /**
   * 役職カードを作成
   * @param {Object} role - 役職データ
   * @returns {HTMLElement} 作成されたカード要素
   */
  createRoleCard(role) {
    const card = document.createElement('div');
    card.className = 'card role-card my-role';
    
    // 役職名からファイル名を生成（日本語を英語に変換する必要あり）
    const roleImageMap = {
      '占い師': 'seer',
      '占星術師': 'fortune_teller',
      '占い師の弟子': 'apprentice',
      '無法者': 'outlaw',
      '村長': 'mayor',
      '怪盗': 'thief',
      'スパイ': 'spy',
      '大熊': 'werewolf',
      '占い人狼': 'seer_wolf',
      'やっかいな豚男': 'troublesome_pig',
      '蛇女': 'snake_woman',
      '博識な子犬': 'knowledgeable_puppy'
    };
    
    const roleImageName = roleImageMap[role.name] || 'unknown';
    const teamClass = role.team === 'village' ? 'village' : 'werewolf';
    
    card.innerHTML = `
      <div class="card-front">
        <img class="role-card-image" src="assets/images/roles/${roleImageName}.png" alt="${role.name}" onerror="this.src='assets/images/roles/unknown.png'">
        <div class="role-card-content">
          <div class="role-name">${role.name}</div>
          <div class="role-team ${teamClass}">${role.team === 'village' ? '市民陣営' : '人狼陣営'}</div>
          <div class="role-cost">コスト: ${role.cost}</div>
          <div class="role-description">${role.description}</div>
        </div>
      </div>
      <div class="card-back"></div>
    `;
    
    return card;
  },
  
  /**
   * 場札カードを作成
   * @returns {HTMLElement} 作成された場札カード要素
   */
  createFieldCard() {
    const card = document.createElement('div');
    card.className = 'card field-card';
    
    card.innerHTML = `
      <div class="card-front">?</div>
      <div class="card-back"></div>
    `;
    
    return card;
  },
  
  /**
   * 複数のカードを順番にフリップ
   * @param {Array<HTMLElement>} cards - カード要素の配列
   * @param {boolean} isFront - 表面を表示するならtrue
   * @param {number} delay - カード間の遅延（ミリ秒）
   * @param {Function} callback - 全てのフリップ完了後のコールバック
   */
  flipCardsSequence(cards, isFront, delay = 200, callback) {
    if (!cards || !cards.length) {
      if (callback) callback();
      return;
    }
    
    let count = 0;
    
    cards.forEach((card, index) => {
      setTimeout(() => {
        this.flipCard(card, isFront, () => {
          count++;
          if (count >= cards.length && callback) {
            callback();
          }
        });
      }, index * delay);
    });
  }
};

export default CardAnimation;