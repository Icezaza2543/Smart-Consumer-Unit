const circuits = document.getElementById("circuits");
const feedback = document.getElementById("feedback");
const gpioPins = [2, 4, 5, 21, 14, 15, 16, 17];
const switches = gpioPins.map((gpio, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "circuit";
  button.setAttribute("role", "switch");
  button.setAttribute("aria-label", "Circuit " + (index + 1));
  button.innerHTML = '<strong>Circuit ' + (index + 1) + '</strong><span class="toggle" aria-hidden="true"></span><span class="state"></span><small>GPIO ' + gpio + '</small>';
  function set(on) {
    button.setAttribute("aria-checked", String(on));
    button.querySelector(".state").textContent = on ? "ON · Contactor closed" : "OFF · Contactor open";
  }
  button.addEventListener("click", () => {
    const on = button.getAttribute("aria-checked") === "false";
    set(on);
    feedback.textContent = "Circuit " + (index + 1) + " → GPIO " + gpio + " → " +
      (on ? "LOW (0) · Contactor closed" : "HIGH (1) · Contactor open");
  });
  circuits.append(button);
  return set;
});
function resetCabinet() {
  switches.forEach(set => set(false));
  feedback.textContent = "All 8 simulated circuits are OFF.";
}
document.getElementById("reset").addEventListener("click", resetCabinet);
resetCabinet();
