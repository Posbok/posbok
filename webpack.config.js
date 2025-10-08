const path = require('path');

module.exports = {
  // Multiple entry points for different pages
  entry: {
    charging: './JS/charging.js',
    goods: './JS/goods.js',
    stock: './JS/stock.js',
    login: './JS/login.js',
    pos: './JS/pos.js',
    reports: './JS/reports.js',
    sell: './JS/sell.js',
    staff: './JS/staff.js',
    business: './JS/business.js',
    signup: './JS/signup.js',
    shops: './JS/shops.js',
    posAndSalesReportAccordion: './JS/posAndSalesReportAccordion.js',
    main: './JS/script.js', // Common JS for the main page if needed
  },

  output: {
    filename: '[name].bundle.js', // This will generate individual bundles for each page
    path: path.resolve(__dirname, 'dist'),
  },

  //   devServer: {
  //     contentBase: path.join(__dirname, 'dist'),
  //     compress: true,
  //     port: 8080,
  //   },

  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    hot: false, // Disable Hot Module Replacement
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'development',
};
