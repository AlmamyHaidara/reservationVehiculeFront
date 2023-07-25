<!-- eslint-disable vue/no-ref-as-operand -->
<!-- eslint-disable prettier/prettier -->
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import ProductService from '@/service/ProductService';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
// import { useLayout } from '@/layout/composables/layout';
// import events from '../../../public/demo/data/events.json';

const toast = useToast();
// const { contextPath } = useLayout();
let images = ref([]);

let vehicules = ref([]);
let vehiculeDialog = ref(false);
let deleteProductDialog = ref(false);
let deleteProductsDialog = ref(false);
let vehicule = ref({});
let difCreate = "";
let selectedProducts = ref(null);
const dt = ref(null);
const deletId = ref();
const filters = ref({});
const submitted = ref(false);
const statuses = ref([
    { label: 'NOTRESERVED', value: 'non reserved' },
    { label: 'RESERVED', value: 'reserved' },
    { label: 'STORED', value: 'stored' }
]);
const categoryVehicule = ref([
    { label: 'PETITE', value: 'petite' },
    { label: 'MEDIUM', value: 'medium' },
    { label: 'LARGE', value: 'large' },
    { label: 'BREAK', value: 'break' },
    { label: 'PREMIUM', value: 'premium' },
    { label: 'MONOSPACE', value: 'monospace' }
]);

const typeCarburant = ref([
    { label: 'ELECTRIQUE', value: 'electric' },
    { label: 'HYBRIDE', value: 'hybrid' },
    { label: 'ESCENCE', value: 'essence' },
    { label: 'GAZOIL', value: 'gazoil' }
]);
const transmission = ref([
    { label: 'AUTOMATIC', value: 'automatic' },
    { label: 'MANUAL', value: 'manual' },
    { label: 'MIX', value: 'mix' }
]);
const kilometrage = ref([
    { label: 'LIMITED', value: 'limited' },
    { label: 'UNLIMITED', value: 'unlimited' }
]);

const productService = new ProductService();

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    productService.getProducts().then((data) => console.log((vehicules.value = data)));
});
// const formatCurrency = (value) => {
//     return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
// };
const formatCurrency = (value) => {
    if (value !== undefined && value !== null) {
        return value.toLocaleString('fr-FR', { style: 'currency', currency: 'FR' }); // Ensure value is not undefined before calling toLocaleString()
    }
    return ''; // Return a default value or handle the undefined case appropriately
};

const openNew = () => {
    difCreate = 'new';
    vehicule.value = {};
    submitted.value = false;
    vehiculeDialog.value = true;
};

const hideDialog = () => {
    vehiculeDialog.value = false;
    submitted.value = false;
};

async function onUpload(event) {
    const files = event.files;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('objectURL[]', files[i]);
    }
    console.log(formData);

    try {
        // Effectuer une requête POST vers le point de terminaison Laravel
        const response = await axios.post('http://localhost:8000/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Traiter la réponse
        console.log(response.data.paths);
        images = response.data.paths;
        localStorage.setItem('images', images);
        return response.data.paths;
    } catch (error) {
        // Gérer les erreurs
        console.error(error);
        return [];
    }
}
const saveVehicule = async () => {
    console.log('yte'+difCreate);
    if (difCreate == 'new') {
        submitted.value = true;
        if (vehicule.value.marque && vehicule.value.marque.trim() && vehicule.value.marque) {
            if (vehicule.value.id) {
                vehicule.value.status = vehicule.value.status.value ? vehicule.value.status.value : vehicule.value.status;
                vehicules.value[findIndexById(vehicule.value.id)] = vehicule.value;
                toast.add({ severity: 'success', summary: 'Successful', detail: 'vehicule Updated', life: 3000 });
            } else {
                const token = localStorage.getItem('userToken'); // Récupérez le jeton d'accès depuis le stockage local
                const img = await axios.post(
                    'http://localhost:8000/api/upload/store',
                    {
                        paths: localStorage.getItem('images')
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                images = img.data.image.id;

                // alert("S'il vous plait selectionner une image");

                console.log(images);
                vehicule.value.matricule = await createId();
                vehicule.value.images_id = images;
                vehicule.value.status = vehicule.value.status ? vehicule.value.status.value : 'MEDIUM';
                vehicule.value.categoryVehicule = vehicule.value.categoryVehicule.value;
                vehicule.value.kilometrage = vehicule.value.kilometrage.value;
                vehicule.value.transmission = vehicule.value.transmission.value;
                vehicule.value.typeCarburant = vehicule.value.typeCarburant.value;
                console.log('=>' + vehicule.value.categoryVehicule);
                vehicules.value.push(vehicule.value);
                console.log(JSON.stringify(vehicule.value));
                const VehiculesJson = JSON.stringify(vehicule.value);
                console.log(VehiculesJson);

                console.log(token);
                axios
                    .post('http://localhost:8000/api/vehicules/create', VehiculesJson, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        // Gérer la réponse
                        console.log(response.data);
                        toast.add({ severity: 'success', summary: 'Successful', detail: 'vehicule Created', life: 3000 });
                    })
                    .catch((error) => {
                        // Gérer les erreurs
                        console.error(error);
                        return false;
                    });
            }
            vehiculeDialog.value = false;
            vehicule.value = {};
        }
    } else if (difCreate === 'update') {
        console.log('Test');
        submitted.value = true;
        if (vehicule.value.marque && vehicule.value.marque.trim() && vehicule.value.marque) {
            if (vehicule.value.id) {
                vehicule.value.status = vehicule.value.status.value ? vehicule.value.status.value : vehicule.value.status;
                vehicules.value[findIndexById(vehicule.value.id)] = vehicule.value;
                toast.add({ severity: 'success', summary: 'Successful', detail: 'vehicule Updated', life: 3000 });
                const token = localStorage.getItem('userToken'); // Récupérez le jeton d'accès depuis le stockage local
                const img = await axios.post(
                    'http://localhost:8000/api/upload/store',
                    {
                        paths: localStorage.getItem('images')
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                images = img.data.image.id;
                console.log(images);
                vehicule.value.matricule = await createId();
                vehicule.value.images_id = images;
                vehicule.value.status = vehicule.value.status ? vehicule.value.status.value : 'MEDIUM';
                vehicule.value.categoryVehicule = vehicule.value.categoryVehicule.value;
                vehicule.value.kilometrage = vehicule.value.kilometrage.value;
                vehicule.value.transmission = vehicule.value.transmission.value;
                vehicule.value.typeCarburant = vehicule.value.typeCarburant.value;
                console.log('=>' + vehicule.value.categoryVehicule);
                vehicules.value.push(vehicule.value);
                console.log(JSON.stringify(vehicule.value));
                const VehiculesJson = JSON.stringify(vehicule.value);
                console.log(VehiculesJson);
                console.log(vehicule.value['id']);
                axios
                    .put(`http://localhost:8000/api/vehicules/edit/${vehicule.value['id']}`, VehiculesJson,{
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json/text'
                        }
                    })
                    .then((response) => {
                        // Gérer la réponse
                        console.log(response.data);
                        toast.add({ severity: 'success', summary: 'Successful', detail: 'vehicule Created', life: 3000 });
                    })
                    .catch((error) => {
                        // Gérer les erreurs
                        console.error(error);
                        return false;
                    });
            } else {
                toast.add({ severity: 'error', summary: 'Successful', detail: 'vehicule Updated', life: 3000 });

                // alert("S'il vous plait selectionner une image");
            }
            vehiculeDialog.value = false;
            vehicule.value = {};
        }
    }
};
const editVehicule = (editVehicule) => {
    vehicule.value = { ...editVehicule };
    console.table('sssss' + vehicule.value);
    vehiculeDialog.value = true;
    difCreate = 'update';
};

const confirmDeleteVehicule = (editVehicule) => {
    vehicule.value = editVehicule;
    deleteProductDialog.value = true;
    if (deleteProductDialog.value) {
        deletId.value = vehicule.value
        console.log('[[[[[[[]]]]]]]' + vehicule.value['id']);
        console.table(vehicule.value);
        return true;
    }
    return;
};

const deleteProduct = () => {
    vehicules.value = vehicules.value.filter((val) => val.id !== vehicule.value.id);
    deleteProductDialog.value = false;
    vehicule.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'vehicule Deleted', life: 3000 });
    productService.deleteVehicule(deletId.value['id']);
    console.log("====="+deletId.value['id']);
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < vehicules.value.length; i++) {
        if (vehicules.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    vehicules.value = vehicules.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'vehicules Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card border-none">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2 new-btn" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="vehicules"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="5"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} vehicules"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage vehicules</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="matricule" header="Matricule" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Matricule</span>
                            {{ slotProps.data.matricule }}
                        </template>
                    </Column>
                    <Column field="model" header="Model" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Model</span>
                            {{ slotProps.data.model }}
                        </template>
                    </Column>
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <div v-for="img in slotProps.data.images" :key="img.id">
                                <!-- {{ img.imageUrl }} -->
                                <span class="p-column-title">Image</span>
                                <img :src="img.imageUrl" :alt="slotProps.data.image" class="shadow-2" width="100" />
                            </div>
                        </template>
                    </Column>
                    <Column field="marque" header="Marque" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Marque</span>
                            {{ formatCurrency(slotProps.data.marque) }}
                        </template>
                    </Column>
                    <Column field="couleur" header="Couleur" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Couleur</span>
                            {{ formatCurrency(slotProps.data.couleur) }}
                        </template>
                    </Column>

                    <Column field="categoryVehicule" header="Category" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.categoryVehicule }}
                        </template>
                    </Column>

                    <Column field="rating" header="Reviews" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rating</span>
                            <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <span :class="'vehicule-badge status-' + (slotProps.data.status ? slotProps.data.status.toLowerCase() : slotProps.data.status)">{{ slotProps.data.status }}</span>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editVehicule(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteVehicule(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="vehiculeDialog" :style="{ width: '850px' }" header="Vehiclu Details" :modal="true" class="p-fluid">
                    <!-- <img src="@/assets/carMali.png"  width="150" class="mt-0 mx-auto mb-5 block shadow-2" /> -->
                    <FileUpload name="demo[]" url="./upload.php" @upload="onUpload($event)" :multiple="true" accept="image/*" :maxFileSize="1000000" v-model="images" />

                    <div class="col-12">
                        <div class="p-fluid formgrid grid">
                            <div class="field col-12 md:col-6">
                                <label for="marque">Marque</label>
                                <InputText id="marque" v-model.trim="vehicule.marque" required="true" autofocus :class="{ 'p-invalid': submitted && !vehicule.marque }" />
                                <small class="p-invalid" v-if="submitted && !vehicule.marque">Marque est requie.</small>
                                <!--  -->
                            </div>
                            <div class="field col-12 md:col-6">
                                <label for="model">Model</label>
                                <InputText id="model" v-model.trim="vehicule.model" required="true" autofocus :class="{ 'p-invalid': submitted && !vehicule.model }" />
                                <small class="p-invalid" v-if="submitted && !vehicule.model">Model is required.</small>
                            </div>
                            <div class="field col-12 md:col-6">
                                <label for="typeCarburant" class="mb-2">Carburant</label>
                                <Dropdown id="typeCarburant" v-model="vehicule.typeCarburant" :options="typeCarburant" optionLabel="label" placeholder="Select a fuel">
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value && slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                        </div>
                                        <div v-else-if="slotProps.value && !slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.toLowerCase()">{{ slotProps.value }}</span>
                                        </div>
                                        <span v-else>
                                            {{ slotProps.placeholder }}
                                        </span>
                                    </template>
                                </Dropdown>
                            </div>

                            <div class="field col-12 md:col-6">
                                <label for="transmission" class="mb-2">Transmission</label>
                                <Dropdown id="transmission" v-model="vehicule.transmission" :options="transmission" optionLabel="label" placeholder="Select a transmission" aria-required="true">
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value && slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                        </div>
                                        <div v-else-if="slotProps.value && !slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.toLowerCase()">{{ slotProps.value }}</span>
                                        </div>
                                        <span v-else>
                                            {{ slotProps.placeholder }}
                                        </span>
                                    </template>
                                </Dropdown>
                                <small class="p-invalid" v-if="submitted && !vehicule.transmission">Transmission is required.</small>
                            </div>

                            <div class="field col-12">
                                <label for="description">Description</label>
                                <Textarea id="description" v-model="vehicule.description" aria-required="true" rows="4" cols="20" />
                                <small class="p-invalid" v-if="submitted && !vehicule.description">Description is required.</small>
                            </div>

                            <div class="field col-12 md:col-6 mt-2">
                                <label for="nbrPlace">Numbre Place</label>
                                <InputNumber id="nbrPlace" v-model="vehicule.nombrePlace" required="true" :class="{ 'p-invalid': submitted && !vehicule.nombrePlace }" inputId="withoutgrouping" :useGrouping="false" />
                                <small class="p-invalid" v-if="submitted && !vehicule.kilometrage">Place is required.</small>
                            </div>
                            <div class="field col-12 md:col-6">
                                <label for="categoryVehicule">categoryVehicule</label>
                                <!-- <InputNumber id="kilometrage" v-model="vehicule.kilometrage" required="true" :class="{ 'p-invalid': submitted && !vehicule.kilometrage }" inputId="mile" suffix=" km" /> -->
                                <Dropdown id="categoryVehicule" v-model="vehicule.categoryVehicule" :options="categoryVehicule" optionLabel="label" placeholder="Select a categoryVehicule" aria-required="true">
                                    <!-- ['w-full md:w-14rem', { 'p-invalid': errorMessage }] -->
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value && slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                        </div>
                                        <div v-else-if="slotProps.value && !slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.toLowerCase()">{{ slotProps.value }}</span>
                                        </div>
                                        <span v-else>
                                            {{ slotProps.placeholder }}
                                        </span>
                                    </template>
                                </Dropdown>
                                <small class="p-invalid" v-if="submitted && !vehicule.kilometrage">categoryVehicule is required.</small>
                            </div>

                            <div class="field col-12 md:col-6">
                                <label for="kilometrage">Kilometrage</label>
                                <!-- <InputNumber id="kilometrage" v-model="vehicule.kilometrage" required="true" :class="{ 'p-invalid': submitted && !vehicule.kilometrage }" inputId="mile" suffix=" km" /> -->
                                <Dropdown id="kilometrage" v-model="vehicule.kilometrage" :options="kilometrage" optionLabel="label" placeholder="Select a kilometrage" aria-required="true">
                                    <!-- ['w-full md:w-14rem', { 'p-invalid': errorMessage }] -->
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value && slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                        </div>
                                        <div v-else-if="slotProps.value && !slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.toLowerCase()">{{ slotProps.value }}</span>
                                        </div>
                                        <span v-else>
                                            {{ slotProps.placeholder }}
                                        </span>
                                    </template>
                                </Dropdown>
                                <small class="p-invalid" v-if="submitted && !vehicule.kilometrage">Kilometrage is required.</small>
                            </div>

                            <div class="field col-6 md:col-3">
                                <label for="statuses">Status</label>
                                <Dropdown id="statuses" v-model="vehicule.status" :options="statuses" optionLabel="label" placeholder="Select a vehiule vehicle type" aria-required="true">
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value && slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                        </div>
                                        <div v-else-if="slotProps.value && !slotProps.value.value">
                                            <span :class="'vehicule-badge status-' + slotProps.value.toLowerCase()">{{ slotProps.value }}</span>
                                        </div>
                                        <span v-else>
                                            {{ slotProps.placeholder }}
                                        </span>
                                    </template>
                                </Dropdown>
                                <small class="p-invalid" v-if="submitted && !vehicule.status">Status is required.</small>
                            </div>
                            <div class="field col-6 md:col-3">
                                <label for="couleur">Couleur</label>
                                <!-- <ColorPicker id="couleur" style="width: 100%" v-model="vehicule.couleur" :class="{ 'p-invalid': submitted && !vehicule.couleur }" format="'rgb' | 'hex' | 'hsb'" defaultColor="#6366F1" /> -->
                                <InputText id="couleur" v-model.trim="vehicule.couleur" required="true" autofocus :class="{ 'p-invalid': submitted && !vehicule.couleur }" />

                                <small class="p-invalid" v-if="submitted && !vehicule.couleur">couleur est requie.</small>
                            </div>
                        </div>
                        <!-- </div> -->
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveVehicule" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="vehicule"
                            >Are you sure you want to delete <b>{{ vehicule.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="vehicule">Are you sure you want to delete the selected vehicules?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
