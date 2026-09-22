export const LoadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);

  const existingScript = document.querySelector(
    'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
  );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.onload = () => {
        if (window.Razorpay) resolve(true);
        else reject(new Error("Razorpay failed to initialize"));
      };
      existingScript.onerror = () => reject(new Error("Unable to load Razorpay"));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) resolve(true);
      else reject(new Error("Razorpay failed to initialize"));
    };

    script.onerror = () => reject(new Error("Unable to load Razorpay"));

    document.body.appendChild(script);
  });
};