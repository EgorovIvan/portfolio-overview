import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addAsset } from '../../store/assetsSlice.ts';
import { getBinanceSymbols } from '../../api/load/getBinanceSymbols.ts';
import classNames from 'classnames';
import './AddAssetForm.scss';

/**
 * Форма добавления актива
 */
const AddAssetForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Управление модальным окном
    const [isOpen, setIsOpen] = useState(false);

    // Поля формы
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [quantity, setQuantity] = useState<number>(0);

    // Данные о монетах из Redux
    const { symbols, status, error } = useSelector((state: RootState) => state.binance);

    // При первом монтировании — грузим список монет с Binance (если не загружен)
    useEffect(() => {
        if (status === 'idle') {
            dispatch(getBinanceSymbols());
        }
    }, [status, dispatch]);

    // Фильтрация монет по поисковому запросу
    const filteredSymbols = symbols.filter((item) =>
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Сохранение нового актива
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSymbol) return;

        // Добавляем актив в store
        dispatch(
            addAsset({
                name: selectedSymbol,
                quantity,
                currentPrice: 0,
                priceChangePercent: 0
            })
        );

        // Сброс полей формы
        setSearchTerm('');
        setSelectedSymbol('');
        setQuantity(0);

        // Закрываем модалку
        setIsOpen(false);
    };

    // Открыть/закрыть модалку
    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        // при закрытии сбросим поиск и выбранный символ
        setSearchTerm('');
        setSelectedSymbol('');
        setQuantity(0);
    };

    // Если данные ещё загружаются или упали с ошибкой, можно отображать что-то поверх всего
    if (status === 'loading') {
        return <div>Загрузка списка монет...</div>;
    }
    if (status === 'failed') {
        return <div>Ошибка при загрузке: {error}</div>;
    }

    return (
        <>
            {/* Кнопка "Add Asset", которая открывает модальное окно */}
            {!isOpen && (
                <button
                    className={classNames('open-button', { 'disabled': (status as 'loading') === 'loading'  })}
                    onClick={openModal}
                    disabled={(status as 'loading') === 'loading'}
                    aria-label={'Открыть форму и добавить актив'}
                    tabIndex={0}
                >
                    Добавить актив
                </button>
            )}

            {isOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <span
                            className={classNames('close-button', { 'hidden': !isOpen })}
                            onClick={closeModal}
                        >
                            &times;
                        </span>
                        <h2>Добавить монету</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Поле поиска */}
                            <input
                                type="text"
                                className={classNames('search-input', { 'error': !searchTerm && filteredSymbols.length === 0 })}
                                placeholder="Поиск монеты..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Блок динамического списка */}
                            <ul className="symbol-list">
                                {filteredSymbols.map((item) => (
                                    <li
                                        key={item.symbol}
                                        className={classNames('symbol-list-item', {
                                            'selected': selectedSymbol === item.symbol,
                                        })}
                                        onClick={() => {
                                            setSelectedSymbol(item.symbol);
                                            setSearchTerm('');
                                        }}
                                    >
                                        {item.symbol}
                                    </li>
                                ))}
                            </ul>

                            {/* Поле, показывающее выбранный символ (можно сделать readOnly) */}
                            <div className="input-box">
                                <label>
                                    Выбранная монета:
                                    <input
                                        className={classNames('coin-input', { 'error': !selectedSymbol })}
                                        type="text"
                                        value={selectedSymbol}
                                        onChange={(e) => setSelectedSymbol(e.target.value)}
                                        placeholder="Symbol"
                                        required
                                    />
                                </label>
                            </div>

                            {/* Количество */}
                            <div className="input-box">
                                <label>
                                    Количество:
                                    <input
                                        className={classNames('count-input', { 'error': quantity <= 0 })}
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        placeholder="Quantity"
                                        required
                                    />
                                </label>
                            </div>

                            <button
                                className={classNames('save-button', { 'disabled': !selectedSymbol || quantity <= 0 })}
                                type="submit"
                                disabled={!selectedSymbol || quantity <= 0}
                                aria-label={`Добавить актив ${selectedSymbol}`}
                                tabIndex={0}
                            >
                                Сохранить
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddAssetForm;