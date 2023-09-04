const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Ir a la página web
  await page.goto('https://www.rivalo.co/en/online-casino/LOBBY');

  // Ejecutar el código JavaScript en la página
  await page.evaluate(() => {
    const casinoSliderElement = document.querySelector('body#svelte .main-content.full-width.svelte-m7793x main.svelte-m7793x .wrapper.svelte-gjbsso .casino-lobby-widget casino-lobby').shadowRoot.querySelector('div[part="CasinoLobby"] .WidgetsSection casino-categories-slider').shadowRoot.querySelector('div[part="CustomStylingContainer"] div[part="CasinoCategoriesContainer"] casino-slider');
    const casinoSliderShadowRoot = casinoSliderElement.shadowRoot;

    const tragamonedasLink = Array.from(casinoSliderShadowRoot.querySelectorAll('a'))
      .find(link => link.textContent.includes('Tragamonedas'));

    if (tragamonedasLink) {
      tragamonedasLink.click();
    } else {
      console.log("No se encontró el enlace 'Tragamonedas'");
    }
  });

  await browser.close();
})();
