import React from 'react';
//import "./index.css"

function Dashboard() {
  return (
<div>
  <header>
    <div class="logo">🥘 Handi Express</div>
    <nav>
      <a href="#">Home</a>
      <a href="#">Menu</a>
      <a href="#">Orders</a>
      <a href="#">Contact</a>
    </nav>
  </header>

  <section class="hero">
    <h1>Authentic Handi at Your Doorstep</h1>
    <p>Freshly made, deeply flavoured—ready to eat!</p>
  </section>

  <section class="menu-grid">
    <div class="dish">
      <img src="images/chicken-handi.jpg" alt="Chicken Handi" />
      <h2>Chicken Handi</h2>
      <p>Rich tomato-based masala with tender chicken</p>
      <span>€12.99</span>
    </div>
    <div class="dish">
      <img src="images/mutton-handi.jpg" alt="Mutton Handi" />
      <h2>Mutton Handi</h2>
      <p>Slow-cooked mutton in traditional spices</p>
      <span>€14.99</span>
    </div>
    <div class="dish">
      <img src="images/paneer-handi.jpg" alt="Paneer Handi" />
      <h2>Paneer Handi</h2>
      <p>Soft paneer in creamy handi sauce</p>
      <span>€11.49</span>
    </div>
    <div class="dish">
      <img src="images/veg-handi.jpg" alt="Mix Veg Handi" />
      <h2>Mix Veg Handi</h2>
      <p>Fresh veggies in mild yet flavorful curry</p>
      <span>€10.99</span>
    </div>
  </section>

  <footer>
    <p>📞 0123-456-789 | 📍 Dublin, Ireland</p>
    <p>&copy; 2025 Handi Express</p>
  </footer>
</div>
  );
}

export default Dashboard;