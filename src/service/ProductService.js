import axios from 'axios';

const contextPath = import.meta.env.BASE_URL;

export default class ProductService {
    getProductsSmall() {
        console.log('=>', contextPath);

        return (
            fetch(contextPath + 'demo/data/products-small.json')
                // return fetch("http://localhost:8000/api/vehicules")
                .then((res) => res.json())
                .then((d) => d.data)
        );
    }

    async getProducts() {
        console.log(contextPath);
        let data = await axios.get('http://localhost:8000/api/vehicules');
        data = data.data.data;
        let imageUrls = [];
        // let imgExtension;
        for (let dd of data) {
            for (let imgs of dd.images) {

                for (let imgPath of imgs.paths.split(',')) {
                    // imgExtension = imgPath.split('.').pop();
                    const blob = new Blob([imgPath]);
                    // const file = new File([blob], 'image', { type: blob.type });
                    // this.readFile(file);

                    const imageUrl = URL.createObjectURL(blob);
                    console.log("[[[]]] "+imageUrl);
                    imageUrls.push(imageUrl);
                }
            }
        }

        // Add image URLs to the data
        data.forEach((dd, index) => {
            dd.images.forEach((imgs, imgIndex) => {
                imgs.imageUrl = imageUrls[index * dd.images.length + imgIndex];
                // console.log('=========imageUrl: ', imgs );
            });
        });
        // console.log('ertyui',data[0].images[0].imageUrl1)

        return data;
    }

    async deleteVehicule(id) {
        console.log(id);
        const token = localStorage.getItem('userToken');
        let data = await axios.delete(`http://localhost:8000/api/vehicules/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        data = data.data.data;
        console.log(data);
    }
    readFile(input) {
        const fr = new FileReader();
        fr.readAsDataURL(input);
        fr.addEventListener('load', () => {
            fr.result;
            // console.log(res);
        });
    }
    getProductsWithOrdersSmall() {
        return fetch(contextPath + 'demo/data/products-orders-small.json')
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
