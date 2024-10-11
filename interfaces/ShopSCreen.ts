interface Price {
    safalAppPrice: number;
    agentAppPrice: number;
    safalBackendPrice: number;
  }

  interface Product {
    _id: string;
    name: string;
    MRP: number;
    description: string;
    image: string[];
    price: Price;
    __v: number;
  }
export default Product;

