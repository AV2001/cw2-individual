let app = new Vue({
  el: '#lessons-page',
  data: {
    sitename: 'Lessons',
    allLessons: [],
    // cart array for storing the lessons added to the cart
    cart: [],
    displayLessons: true,
    searchTerm: '',
    sort: {
      sortValue: '',
      sortOrder: '',
    },
    form: {
      fullName: '',
      phoneNumber: '',
    },
  },

  created() {
    // sends a get request to '/' route
    fetch('collection/lessons').then(res => {
      res.json().then(data => {
        this.allLessons = data;
      });
    });
  },

  methods: {
    // adds the chosen lesson to the cart and reduces the spaces left
    addToCart(lesson) {
      this.cart.push(lesson);
      lesson.spacesLeft--;
    },

    // removes a chosen lesson from the cart and increases the spaces left
    removeFromCart(id) {
      for (let i = 0; i < this.cart.length; i++) {
        // checks if lesson id in cart is same as the id passed as param
        if (this.cart[i].id === id) {
          this.cart.splice(i, 1);
          // uses break because we want to remove only one lesson at a time
          break;
        }
      }

      // increases the spaces left of the lesson that was removed from the cart
      for (let i = 0; i < this.allLessons.length; i++) {
        if (this.allLessons[i].id === id) {
          this.allLessons[i].spacesLeft++;
        }
      }
    },

    /*
      terinary operatory that is used to switch
      between the lessons and the checkout page
    */
    displayCheckoutPage() {
      this.displayLessons = this.displayLessons ? false : true;
    },

    // adds the product to the cart as long as spaces left is greater than 0
    canAddToCart(lesson) {
      return lesson.spacesLeft !== 0;
    },

    // method thats called when user clicks the submit button
    submitOrder(message, event) {
      if (event) {
        // to prevent button from reloading the page
        event.preventDefault();

        // Create an order object to add to the order collection
        const order = {
          name: this.form.fullName,
          phoneNumber: this.form.phoneNumber,
          lesson: this.cart,
        };

        // Fetch 'POST' requst to send an order to the backend.
        fetch('collection/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        });

        // Fetch 'PUT' request to update the spaces of a lesson.
        fetch('collection/lessons', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.cart),
        });
      }
      alert(message);
      // resets the full name, phone number, and the cart
      this.form.fullName = '';
      this.form.phoneNumber = null;
      this.cart = [];
    },
  },

  computed: {
    // returns the number of lessons in the cart
    cartItemCount() {
      return this.cart.length;
    },

    // returns the lessons stored in the cart
    cartItems() {
      return this.cart;
    },

    /*
    checks if the cart is empty so that the checkout page can display a different message when the cart is empty
    */
    isCheckoutPageEmpty() {
      return this.cart.length === 0;
    },

    sortedLessons() {
      /*
        returns the lessons whose subject contains letters
        typed the user in the search box
      */
      if (this.searchTerm.length > 0) {
        this.searchTerm = this.searchTerm.toLowerCase();
        const displayLessons = [];
        for (let i = 0; i < this.allLessons.length; i++) {
          if (
            this.allLessons[i].subject.toLowerCase().includes(this.searchTerm)
          ) {
            displayLessons.push(this.allLessons[i]);
          } else if (
            this.allLessons[i].location.toLowerCase().includes(this.searchTerm)
          ) {
            displayLessons.push(this.allLessons[i]);
          }
        }
        return displayLessons;
      }

      // search functionality
      if (this.searchTerm.length > 0) {
        this.searchTerm = this.searchTerm.toLowerCase();
        const displayLessons = [];
        fetch(`collection/lessons/search/${this.searchTerm}`).then(res => {
          res.json().then(data => {
            for (let i = 0; i < data.length; i++) {
              displayLessons.push(data[i]);
            }
          });
        });
        return displayLessons;
      }

      // returns all lessons by default when none of the sorting is applied
      if (!(this.sort.sortValue && this.sort.sortOrder)) {
        return this.allLessons;
      }

      // Sort by price in ascending or descending order
      if (this.sort.sortValue === 'price') {
        if (this.sort.sortOrder === 'ascending') {
          return this.allLessons.sort((a, b) => a.price - b.price);
        } else if (this.sort.sortOrder === 'descending') {
          return this.allLessons.sort((a, b) => b.price - a.price);
        }
      }

      // Sorts by subject in alphabetic order based on user's choice
      if (this.sort.sortValue === 'subject') {
        this.allLessons.sort((a, b) => {
          if (a.subject > b.subject) {
            return 1;
          }
          if (a.subject < b.subject) {
            return -1;
          }
          return 0;
        });
        if (this.sort.sortOrder === 'ascending') {
          return this.allLessons;
        } else {
          return this.allLessons.reverse();
        }
      }

      // Sorts lessons by availability in ascending or descending order
      if (this.sort.sortValue === 'availability') {
        if (this.sort.sortOrder === 'ascending') {
          return this.allLessons.sort((a, b) => a.spacesLeft - b.spacesLeft);
        } else if (this.sort.sortOrder === 'descending') {
          return this.allLessons.sort((a, b) => b.spacesLeft - a.spacesLeft);
        }
      }

      // Sorts by location in alphabetic order
      if (this.sort.sortValue === 'location') {
        this.allLessons.sort((a, b) => {
          if (a.location > b.location) {
            return 1;
          }
          if (a.location < b.location) {
            return -1;
          }
          return 0;
        });
        if (this.sort.sortOrder === 'ascending') {
          return this.allLessons;
        } else {
          return this.allLessons.reverse();
        }
      }
    },

    // regex that must be satisifed by the user for the button to be clickable
    checkoutFormValidation() {
      // allows letters and space
      const fullNameRegex = /^[A-Za-z\s]*$/;

      // phone number must contain 10 digits
      const phoneNumberRegex = /^[0-9]{10}$/;
      return (
        this.form.fullName.length > 3 &&
        fullNameRegex.test(this.form.fullName) &&
        phoneNumberRegex.test(this.form.phoneNumber)
      );
    },
  },
});
