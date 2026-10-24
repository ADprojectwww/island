window.SaveManager = {
    SAVE_KEY: 'island_from_nothing_save',
    SAVE_VERSION: 1,

    save: function(gameData) {
        try {
            const dataToSave = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                data: gameData
            };
            const jsonString = JSON.stringify(dataToSave);
            localStorage.setItem(this.SAVE_KEY, jsonString);
            console.log('Гра успішно збережена.');
            return true;
        } catch (error) {
            console.error('Помилка при збереженні гри:', error);
            return false;
        }
    },

    load: function() {
        try {
            const jsonString = localStorage.getItem(this.SAVE_KEY);
            if (!jsonString) {
                console.log('Збереження не знайдено.');
                return null;
            }

            const parsedData = JSON.parse(jsonString);
            
            if (!parsedData || !parsedData.version || !parsedData.data) {
                console.warn('Дані збереження пошкоджені або мають невірний формат.');
                return null;
            }

            if (parsedData.version !== this.SAVE_VERSION) {
                console.warn(`Версія збереження (${parsedData.version}) відрізняється від поточної (${this.SAVE_VERSION}). Можливі проблеми сумісності.`);
            }

            console.log('Гра успішно завантажена.');
            return parsedData.data;

        } catch (error) {
            console.error('Помилка при завантаженні гри:', error);
            return null;
        }
    },

    hasSave: function() {
        try {
            return localStorage.getItem(this.SAVE_KEY) !== null;
        } catch (error) {
            console.error('Помилка перевірки наявності збереження:', error);
            return false;
        }
    },

    deleteSave: function() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('Збереження успішно видалено.');
            return true;
        } catch (error) {
            console.error('Помилка при видаленні збереження:', error);
            return false;
        }
    }
};
