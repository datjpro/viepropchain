/**
 * ========================================================================
 * PRICE UTILITIES - Convert between ETH and Wei
 * ========================================================================
 */

/**
 * Convert price from wei to ETH
 * @param {string|number} priceInWei - Price in wei
 * @returns {string} Price in ETH
 */
export const weiToEth = (priceInWei) => {
  if (!priceInWei || priceInWei === "0") return "0";

  // Handle string numbers properly
  const weiString = priceInWei.toString();

  // Always use string manipulation for precision
  const weiLength = weiString.length;
  if (weiLength <= 18) {
    // Pad with zeros if needed
    const paddedWei = weiString.padStart(18, "0");
    const ethResult = "0." + paddedWei.replace(/0+$/, "") || "0";
    return ethResult === "0." ? "0" : ethResult;
  } else {
    // Large numbers: split at 18 digits from right
    const ethPart = weiString.slice(0, weiLength - 18) || "0";
    const decimalPart = weiString.slice(weiLength - 18);

    // Remove trailing zeros from decimal part
    const cleanDecimal = decimalPart.replace(/0+$/, "");

    const result = cleanDecimal ? `${ethPart}.${cleanDecimal}` : ethPart;
    console.log("🔢 Large number result:", {
      ethPart,
      decimalPart,
      cleanDecimal,
      result,
    });
    return result;
  }
};
/**
 * Convert price from ETH to wei
 * @param {string|number} priceInEth - Price in ETH
 * @returns {string} Price in wei
 */
export const ethToWei = (priceInEth) => {
  if (!priceInEth || priceInEth === "0") return "0";

  // Convert to number first, then multiply by 1e18
  const eth = parseFloat(priceInEth);
  // eslint-disable-next-line no-undef
  const wei = BigInt(Math.floor(eth * 1e18));

  return wei.toString();
};

/**
 * Format price for display (ETH)
 * @param {string|number|object} price - Price in wei or object with amount
 * @param {string} currency - Currency symbol (default: ETH)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = "ETH") => {
  if (!price) return "Liên hệ";

  let priceInWei;

  // Handle object format { amount: "...", currency: "..." }
  if (typeof price === "object" && price.amount) {
    priceInWei = price.amount;
    currency = price.currency || currency;
  } else {
    priceInWei = price;
  }

  // Convert wei to ETH
  const ethValue = weiToEth(priceInWei);
  const ethNumber = parseFloat(ethValue);

  // Format with appropriate decimals
  let formatted;
  if (ethNumber >= 1000) {
    formatted = ethNumber.toLocaleString("en-US", { maximumFractionDigits: 2 });
  } else if (ethNumber >= 1) {
    formatted = ethNumber.toFixed(4);
  } else {
    formatted = ethNumber.toFixed(6);
  }

  return `${formatted} ${currency}`;
};

/**
 * Format price in VND (for display purposes)
 * Assumes 1 ETH = 100,000,000 VND (100 million VND)
 * @param {string|number|object} price - Price in wei or object with amount
 * @returns {string} Formatted price in VND
 */
export const formatPriceVND = (price) => {
  if (!price) return "Liên hệ";

  let priceInWei;

  if (typeof price === "object" && price.amount) {
    priceInWei = price.amount;
  } else {
    priceInWei = price;
  }

  // Convert wei to ETH first
  const ethString = weiToEth(priceInWei);
  const ethValue = parseFloat(ethString);

  console.log("🧮 formatPriceVND debug:", {
    originalPrice: price,
    priceInWei: priceInWei,
    ethString: ethString,
    ethValue: ethValue,
  });

  // Convert ETH to VND (1 ETH = 100M VND)
  const vndValue = ethValue * 100000000;

  // Format in billions (tỷ)
  const billions = vndValue / 1000000000;

  return `${billions.toFixed(2)} tỷ VND`;
};

/**
 * Validate price input (ETH)
 * @param {string} priceInput - Price input from user
 * @returns {boolean} True if valid
 */
export const isValidPrice = (priceInput) => {
  if (!priceInput) return false;

  const price = parseFloat(priceInput);
  return !isNaN(price) && price > 0;
};

/**
 * Parse price input from user (ETH)
 * @param {string} priceInput - Price input from user in ETH
 * @returns {string} Price in wei
 */
export const parsePriceInput = (priceInput) => {
  if (!isValidPrice(priceInput)) {
    throw new Error("Invalid price input");
  }

  return ethToWei(priceInput);
};
