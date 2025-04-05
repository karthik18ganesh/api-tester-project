export const mockLogin = ({ username, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === "admin" && password === "admin") {
          resolve({ status: "success" });
        } else {
          reject({ status: "error", message: "Invalid credentials" });
        }
      }, 1000);
    });
  };
  