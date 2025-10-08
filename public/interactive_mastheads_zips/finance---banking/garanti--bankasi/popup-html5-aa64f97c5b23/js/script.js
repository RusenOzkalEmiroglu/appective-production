document.addEventListener('DOMContentLoaded', () => {
    const loanForm = document.getElementById('loan-form');
    const amountInput = document.getElementById('amount');
    const monthsSelect = document.getElementById('months');
    const errorDisplay = document.getElementById('error-display');
    
    // Modal elements
    const modal = document.getElementById('result-modal');
    const modalResultDisplay = document.getElementById('modal-result-display');
    const closeBtn = document.querySelector('.close-btn');

    loanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorDisplay.textContent = ''; // Clear previous errors

        let amount = amountInput.value.replace(/[^0-9]/g, '');
        amount = parseInt(amount, 10);

        const months = parseInt(monthsSelect.value, 10);

        if (isNaN(amount) || amount < 5000 || amount > 500000) {
            errorDisplay.textContent = 'Lütfen 5.000 - 500.000 TL arası bir tutar girin.';
            return;
        }

        // Placeholder interest rate (e.g., 2.5% per month)
        const monthlyInterestRate = 0.0379; // %3.79
        
        const monthlyPayment = (amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -months));
        const totalPayment = monthlyPayment * months;

        // Format numbers to Turkish currency style
        const formatCurrency = (number) => {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(number).replace('₺', '').trim();
        };

        modalResultDisplay.innerHTML = `
            <p><strong>Aylık Taksit:</strong> ${formatCurrency(monthlyPayment)} TL</p>
            <p><strong>Toplam Geri Ödeme:</strong> ${formatCurrency(totalPayment)} TL</p>
            <p><small>Hesaplamada kullanılan aylık faiz oranı: %${(monthlyInterestRate * 100).toFixed(2)}</small></p>
        `;
        
        modal.style.display = 'flex'; // Show the modal
    });

    // Close the modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });
});
