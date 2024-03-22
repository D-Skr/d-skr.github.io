document.addEventListener("DOMContentLoaded", () => {
  const homeBtn = document.getElementById("home-btn");
  const startBtn = document.getElementById("start-btn");
  const expenseForm = document.getElementById("expense-form");
  const addParticipantBtn = document.getElementById("add-participant-btn");
  const participantNameInput = document.getElementById("participant-name");
  const participantsList = document.getElementById("participants-list");
  const equalizeBtn = document.getElementById("equalize-btn");
  const resultsContainer = document.getElementById("results");
  const header = document.querySelector("header");
  const loginButtons = document.getElementById("login"); // all 3 buttons

  // const newUserExpenseBtn = document.getElementById("new-expense-btn");

  // Reload the page to return to the home screen
  homeBtn.addEventListener("click", () => {
    //window.location.reload();
    window.location.reload();
  });

  startBtn.addEventListener("click", () => {
    header.style.display = "none";
    loginButtons.style.display = "none";
    expenseForm.style.display = "block";
    expenseForm.classList.add("fade-in");
  });

  addParticipantBtn.addEventListener("click", () => {
    const name =
      participantNameInput.value.trim()[0].toUpperCase() +
      participantNameInput.value.trim().slice(1).toLowerCase();
    if (name) {
      const participantDiv = document.createElement("div");
      participantDiv.classList.add(
        "participant-item",
        "bg-gray-200",
        "flex",
        "flex-col",
        "p-4",
        "rounded-lg",
        "shadow",
        "mb-4",
        "fade-in"
      );

      const topRowDiv = document.createElement("div");
      topRowDiv.classList.add("flex", "items-center", "mb-4");
      participantDiv.appendChild(topRowDiv);

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = name;
      nameInput.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "rounded",
        "mr-2",
        "flex-grow",
        "font-bold",
        "fade-in"
      );
      topRowDiv.appendChild(nameInput);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "-";
      deleteBtn.classList.add(
        "bg-orange-500",
        "text-white",
        "w-8",
        "h-8",
        "rounded",
        "hover:bg-orange-600"
      );
      deleteBtn.addEventListener("click", () => {
        participantDiv.remove();
        updateEqualizeButtonState();
      });
      topRowDiv.appendChild(deleteBtn);

      const expensesDiv = document.createElement("div");
      expensesDiv.classList.add("flex", "flex-col");
      participantDiv.appendChild(expensesDiv);

      addExpenseInput(expensesDiv, participantDiv);

      participantsList.appendChild(participantDiv);
      participantNameInput.value = "";

      updateEqualizeButtonState();
    }
  });

  function addExpenseInput(expensesDiv, participantDiv) {
    const expenseInputDiv = document.createElement("div");
    expenseInputDiv.classList.add("flex", "items-center", "mb-4", "fade-in");
    expensesDiv.appendChild(expenseInputDiv);

    const expenseInput = document.createElement("input");
    expenseInput.type = "number";
    expenseInput.placeholder = "Add expense";
    expenseInput.classList.add(
      "expense-input",
      "border",
      "border-gray-300",
      "p-2",
      "rounded-full",
      "mr-2",
      "flex-grow"
    );
    expenseInputDiv.appendChild(expenseInput);

    const addExpenseBtn = document.createElement("button");
    addExpenseBtn.textContent = "+";
    addExpenseBtn.classList.add(
      "add-expense-btn",
      "bg-green-500",
      "text-white",
      "w-8",
      "h-8",
      "rounded-full",
      "hover:bg-green-600"
    );
    addExpenseBtn.addEventListener("click", () => {
      const expenseValue = parseFloat(expenseInput.value);
      if (!isNaN(expenseValue) && expenseValue > 0) {
        expenseInput.setAttribute("readonly", "readonly");
        addExpenseBtn.textContent = "-";
        addExpenseBtn.classList.remove("bg-green-500", "hover:bg-green-600");
        addExpenseBtn.classList.add("bg-red-500", "hover:bg-red-600");
        addExpenseBtn.removeEventListener("click", addExpenseBtn.clickEvent);
        addExpenseBtn.addEventListener("click", () => {
          expenseInputDiv.remove();
          // Check if there are no more expense inputs, then add a new empty input field
          if (
            expensesDiv.querySelectorAll(".expense-input[readonly]").length ===
            0
          ) {
            addExpenseInput(expensesDiv, participantDiv);
          }
        });

        // Check if there is already an empty input field, if not, add a new one
        const emptyInputs = expensesDiv.querySelectorAll(
          ".expense-input:not([readonly])"
        );
        if (emptyInputs.length === 0) {
          addExpenseInput(expensesDiv, participantDiv);
        }
      }
    });
    addExpenseBtn.clickEvent = addExpenseBtn.onclick;

    expenseInputDiv.appendChild(addExpenseBtn);
  }

  equalizeBtn.addEventListener("click", () => {
    const participants = Array.from(
      participantsList.querySelectorAll(".participant-item")
    ).map((item) => {
      const name = item.querySelector("input[type='text']").value;
      const expenses = Array.from(item.querySelectorAll(".expense-input"))
        .map((expenseInput) => parseFloat(expenseInput.value))
        .filter((expense) => !isNaN(expense) && expense > 0); // Filter out empty or invalid expenses
      const totalExpense = expenses.reduce((acc, val) => acc + val, 0);
      return { name, totalExpense };
    });
    console.log(participants);

    // Perform equalization logic
    const totalExpenses = participants.reduce(
      (acc, participant) => acc + participant.totalExpense,
      0
    );
    console.log(totalExpenses);
    const avgExpense = totalExpenses / participants.length;
    console.log(avgExpense);
    const equalizedResult = participants.map((participant) => {
      const balance = participant.totalExpense - avgExpense;
      return { ...participant, balance };
    });
    console.log(equalizedResult);
    // Display the equalization results
    displayResults({ totalExpenses, avgExpense, equalizedResult });
  });

  function updateEqualizeButtonState() {
    const participantCount =
      participantsList.querySelectorAll(".participant-item").length;
    if (participantCount > 1) equalizeBtn.classList.remove("hidden");
    else equalizeBtn.classList.add("hidden");
  }

  function displayResults({ totalExpenses, avgExpense, equalizedResult }) {
    equalizedResult.sort((a, b) => a.balance - b.balance);
    const transactions = [];
    let i = 0; // Index for participants with negative balance (owes money)
    let j = equalizedResult.length - 1; // Index for participants with positive balance (receives money)

    // Create transactions until all balances are settled
    while (i < j) {
      const payer = equalizedResult[i];
      const receiver = equalizedResult[j];
      const amount = Math.min(-payer.balance, receiver.balance);

      transactions.push({
        from: payer.name,
        to: receiver.name,
        amount: amount.toFixed(2),
      });

      payer.balance += amount;
      receiver.balance -= amount;

      if (payer.balance === 0) {
        i++;
      }
      if (receiver.balance === 0) {
        j--;
      }
    }

    resultsContainer.innerHTML = `
      <p><span class="font-bold">Total expenses:</span> $${totalExpenses.toFixed(
        2
      )}</p>
      <p><span class="font-bold">Average expense:</span> $${avgExpense.toFixed(
        2
      )}</p>
      ${transactions
        .map(
          (transaction) => `
      <p><span class="font-bold">${transaction.from}</span> owes <span class="font-bold">${transaction.to}</span>: $${transaction.amount}</p>
  `
        )
        .join("")}
  `;
    resultsContainer.style.display = "block";
    resultsContainer.classList.add(
      "fade-in",
      "participant-item",
      "bg-gray-200",
      "p-8",
      "rounded-lg",
      "shadow",
      "mb-4"
    );
  }
});
