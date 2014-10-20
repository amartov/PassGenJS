/**
 * @author Aleksey Martov (c) 2014 <a-martov@linber.ru>
 * The MIT License (MIT)
 * @version 0.1
 */
var PassGenJS = (function () {
    "use strict";

    var strLetters = 'qwertyuiopasdfghjklzxcvbnm';
    var strLettersUpper = strLetters.toUpperCase();
    var strNumbers = '0123456789';
    var strSymbols = '!@#$%^&*()_+-={}[]:;|?<>/"\'~';
    var defaultGenerateRecursion = 1;

    var strLettersArray = strLetters.split('');
    var strLettersUpperArray = strLettersUpper.split('');
    var strNumbersArray = strNumbers.split('');
    var strSymbolsArray = strSymbols.split('');

    /* Содержит объект параметров для генерации паролей */
    var scoreVariants = null;

    /**
     * Возвращает случайное число в диапазоне min-max (служебный метод)
     * @private
     * @param {Number} min Минимальное значение
     * @param {Number} max Максимальное значение
     * @returns {Number} Случайное число
     */
    function _getRandom(min, max) {
        var range = max - min + 1;
        return Math.floor(Math.random() * range) + min;
    }

    /**
     * Возвращает случайный элемент из массива arrayVariants (служебный метод)
     * @private
     * @param {Array} arrayVariants Массив элементов из которых будет выбран случайный
     * @returns {*} Значение выбранного элемента из массива arrayVariants
     */
    function _getRandomOfVariants(arrayVariants) {
        arrayVariants = arrayVariants ? arrayVariants : [];
        return arrayVariants.length > 0 ? arrayVariants[_getRandom(0, arrayVariants.length - 1)] : null;
    }

    /**
     * Генерирует и возвращает пароль (служебный метод)
     * @private
     * @param {Object} obj Объект, содержащий параметры для генерации пароля
     * obj.numbers {Number} Число цифр в пароле
     * obj.letters {Number} Число букв в пароле
     * obj.lettersUpper {Number} Число заглавных букв в пароле
     * obj.symbols {Number} Число символов в пароле
     * @returns {String} Сгенерированный пароль
     */
    function _generate(obj) {
        obj = obj ? obj : {};
        var symbols = obj.symbols ? obj.symbols : 0;
        var numbers = obj.numbers ? obj.numbers : 0;
        var letters = obj.letters ? obj.letters : 0;
        var lettersUpper = obj.lettersUpper ? obj.lettersUpper : 0;

        var totalLength = symbols + numbers + letters + lettersUpper;
        var result = '';

        var objGeneratedChars = {
            letters: 0,
            lettersUpper: 0,
            numbers: 0,
            symbols: 0
        };
        var objVariantsSource = {
            letters: true,
            lettersUpper: true,
            numbers: true,
            symbols: true
        };

        for (var i = 0; i < totalLength; i++) {

            if (objVariantsSource['letters'] && objGeneratedChars.letters == letters) {
                objVariantsSource['letters'] = false;
            }

            if (objVariantsSource['lettersUpper'] && objGeneratedChars.lettersUpper == lettersUpper) {
                objVariantsSource['lettersUpper'] = false;
            }

            if (objVariantsSource['numbers'] && objGeneratedChars.numbers == numbers) {
                objVariantsSource['numbers'] = false;
            }

            if (objVariantsSource['symbols'] && objGeneratedChars.symbols == symbols) {
                objVariantsSource['symbols'] = false;
            }

            var arrayVariantsSource = [];
            for (var key in objVariantsSource) {

                if (objVariantsSource[key]) {
                    arrayVariantsSource[arrayVariantsSource.length] = key;
                }
            }

            var typeChar = _getRandomOfVariants(arrayVariantsSource);
            var resultChar = '';

            switch (typeChar) {
                case 'letters':
                {
                    resultChar = strLettersArray[_getRandom(0, strLettersArray.length - 1)];
                    objGeneratedChars.letters++;
                    break;
                }
                case 'lettersUpper':
                {
                    resultChar = strLettersArray[_getRandom(0, strLettersArray.length - 1)].toUpperCase();
                    objGeneratedChars.lettersUpper++;
                    break;
                }
                case 'numbers':
                {
                    resultChar = strNumbersArray[_getRandom(0, strNumbersArray.length - 1)];
                    objGeneratedChars.numbers++;
                    break;
                }
                case 'symbols':
                {
                    resultChar = strSymbolsArray[_getRandom(0, strSymbolsArray.length - 1)];
                    objGeneratedChars.symbols++;
                    break;
                }
            }

            result += resultChar;
        }

        return result;
    }

    /**
     * Возвращает сгенерированный пароль
     * @private
     * @param {Object} obj Объект, содержащий параметры для генерации пароля
     * obj.score {Number} Число в диапазоне 1-4. Чем больше, тем надежнее пароль
     * obj.maxGenerateRecursion {Number} Сколько итераций использовать для нахождения более стойкого пароля
     * От 0 до n. Значение по умолчанию 6. Чем больше значение, тем больше времени требуется на генерацию
     * и получение более надежного пароля.
     * obj.numbers {Number} Число цифр в пароле
     * obj.letters {Number} Число букв в пароле
     * obj.lettersUpper {Number} Число заглавных букв в пароле
     * obj.symbols {Number} Число символов в пароле
     * @returns {String} Сгенерированный пароль
     */
    function _getPassword(obj) {
        var result = '';
        var resultEntropy = 0;
        var maxEntropy = 0;
        var generateRecursion = obj.maxGenerateRecursion !== undefined ? obj.maxGenerateRecursion : defaultGenerateRecursion;
        var objParams = {};

        if (!obj) {
            objParams = {
                letters: 4,
                lettersUpper: 2,
                numbers: 2,
                symbols: 1
            };
        } else {

            if (obj.score || obj.reliabilityPercent) {

                /* Если не генерировали параметры для генерации паролей, то генерируем их */
                if (!scoreVariants) {
                    scoreVariants = _generateScoreVariants();
                }

                var tmpScoreVariants = scoreVariants;
                var arrayVariants = [];

                if (obj.score !== undefined) {
                    obj.score = parseInt(obj.score);

                    if (obj.score == 0) {
                        return '';
                    }

                    if (obj.score > 4 || obj.score < 0) {
                        obj.score = 4;
                    }

                    for (var keyChars in tmpScoreVariants) {

                        if (tmpScoreVariants[keyChars].score == obj.score) {
                            arrayVariants[arrayVariants.length] = keyChars;
                        }
                    }
                } else if (obj.reliabilityPercent !== undefined) {
                    obj.reliabilityPercent = parseInt(obj.reliabilityPercent);
                    var arrayReliabilityPercentExist = [];

                    if (obj.reliabilityPercent == 0) {
                        return '';
                    }

                    if (obj.reliabilityPercent > 100 || obj.reliabilityPercent < 0) {
                        obj.reliabilityPercent = 100;
                    }

                    for (var keyChars in tmpScoreVariants) {
                        arrayReliabilityPercentExist[arrayReliabilityPercentExist.length] = tmpScoreVariants[keyChars].reliabilityPercent;

                        if (tmpScoreVariants[keyChars].reliabilityPercent == obj.reliabilityPercent) {
                            arrayVariants[arrayVariants.length] = keyChars;
                        }
                    }

                    if (!arrayVariants.length) {
                        arrayReliabilityPercentExist.sort(function(a, b){
                            return (a < b) ? -1 : (a > b) ? 1 : 0;
                        });
                        var arrayReliabilityPercentExistLength = arrayReliabilityPercentExist.length;
                        var reliabilityPercentExist = null;

                        for (var i = 0; i < arrayReliabilityPercentExistLength; i++) {

                            if (arrayReliabilityPercentExist[i] > obj.reliabilityPercent) {
                                reliabilityPercentExist = arrayReliabilityPercentExist[i];
                                break;
                            }
                        }

                        if (!reliabilityPercentExist) {
                            arrayReliabilityPercentExist.reverse();

                            for (var i = 0; i < arrayReliabilityPercentExistLength; i++) {

                                if (arrayReliabilityPercentExist[i] < obj.reliabilityPercent) {
                                    reliabilityPercentExist = arrayReliabilityPercentExist[i];
                                    break;
                                }
                            }
                        }

                        for (var keyChars in tmpScoreVariants) {

                            if (tmpScoreVariants[keyChars].reliabilityPercent == reliabilityPercentExist) {
                                arrayVariants[arrayVariants.length] = keyChars;
                            }
                        }
                    }
                }

                var randomVariant = _getRandomOfVariants(arrayVariants);

                if (randomVariant) {
                    randomVariant = randomVariant.split('-');

                    objParams = {
                        letters: randomVariant[1],
                        lettersUpper: randomVariant[3],
                        numbers: randomVariant[0],
                        symbols: randomVariant[2]
                    };
                }
            } else {
                objParams = {
                    letters: obj.letters,
                    lettersUpper: obj.lettersUpper,
                    numbers: obj.numbers,
                    symbols: obj.symbols
                };
            }
        }

        for (var i = 0; i <= generateRecursion; i++) {
            var tmpResult = _generate(objParams);
            resultEntropy = _getScore(tmpResult).entropy;

            if (!obj.score) {

                if (maxEntropy < resultEntropy) {
                    maxEntropy = resultEntropy;
                    result = tmpResult;
                }
            } else {

                if (obj.score == _getScore(tmpResult).score) {
                    result = tmpResult;
                    break;
                }
            }
        }

        if (!result) {
            result = tmpResult;
        }

        return result;
    }

    function _getScore(password) {
        var objLengthMany = {};
        var entropy = 0;
        var score = 0;
        var passwordArray = password.split('');

        for (var key in passwordArray) {

            if (!objLengthMany['strLetters'] && strLetters.indexOf(passwordArray[key]) > -1) {
                objLengthMany['strLetters'] = strLetters.length;
            } else if (!objLengthMany['strNumbers'] && strNumbers.indexOf(passwordArray[key]) > -1) {
                objLengthMany['strNumbers'] = strNumbers.length;
            } else if (!objLengthMany['strSymbols'] && strSymbols.indexOf(passwordArray[key]) > -1) {
                objLengthMany['strSymbols'] = strSymbols.length;
            } else if (!objLengthMany['strLettersUpper'] && strLettersUpper.indexOf(passwordArray[key]) > -1) {
                objLengthMany['strLettersUpper'] = strLettersUpper.length;
            }
        }

        var lengthMany = 0;
        for (var key in objLengthMany) {
            lengthMany += objLengthMany[key];
        }

        if (lengthMany) {
            entropy = Math.round(password.length * (Math.log(lengthMany) / Math.log(2)));
        } else {
            entropy = 0;
        }

        if (entropy > 0 && entropy < 56) {
            score = 1;
        } else if (entropy >= 56 && entropy < 64) {
            score = 2;
        } else if (entropy >= 64 && entropy < 128) {
            score = 3;
        } else if (entropy >= 128) {
            score = 4;
        }

        var reliability = entropy / (128 / 100);
        reliability = reliability < 100 ? reliability : 100;

        return {
            password: password,
            score: score,
            entropy: entropy,
            reliability: reliability,
            reliabilityPercent: Math.round(reliability)
        };
    }

    /**
     * Генерирует и возвращает объект параметров для последующей генерации паролей
     * @private
     * (будет больше вариантов параметров для генерации паролей)
     * @returns {Object}
     */
    function _generateScoreVariants() {
        console.time('ty');
        var objResult = {};

        for (var i = 0; i < 6666; i++) {
            var strIndexIteration = i + '';

            if (i < 10) {
                strIndexIteration = '000' + i;
            } else if (i >= 10 && i < 100) {
                strIndexIteration = '00' + i;
            } else if (i >= 100 && i < 1000) {
                strIndexIteration = '0' + i;
            }

            var strIndexIterationArray = strIndexIteration.split('');

            if (parseInt(strIndexIterationArray[0]) + parseInt(strIndexIterationArray[1]) + parseInt(strIndexIterationArray[2]) + parseInt(strIndexIterationArray[3]) > 20) {
                continue;
            }

            var keyForObjResult = strIndexIterationArray.join('-');

            var result = strNumbers.substr(0, strIndexIterationArray[0]) + strLetters.substr(0, strIndexIterationArray[1])
                + strSymbols.substr(0, strIndexIterationArray[2]) + strLettersUpper.substr(0, strIndexIterationArray[3]);

            var score = _getScore(result);

            if (score.score == 0) {
                continue;
            }

            objResult[keyForObjResult] = {
                score: score.score,
                reliabilityPercent: score.reliabilityPercent
            }
        }

        console.timeEnd('ty');
        return objResult;
    }

    return {
        /**
         * Обертка над _getPassword
         * @see _getPassword
         * @returns {String}
         */
        getPassword: function (params) {
            var result = _getPassword(params);
            return result;
        },

        /**
         * Обертка над _getScore
         * @see _getScore
         * @returns {Object}
         */
        getScore: function (password) {
            return _getScore(password);
        }
    };
})();
