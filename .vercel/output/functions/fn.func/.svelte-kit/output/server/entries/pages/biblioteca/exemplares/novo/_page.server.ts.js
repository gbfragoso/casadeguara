import "../../../../../chunks/prisma.js";
import "../../../../../chunks/index.js";
const actions = {
  default: async ({ request }) => {
    Object.fromEntries(await request.formData());
    return {
      status: 201
    };
  }
};
export {
  actions
};
