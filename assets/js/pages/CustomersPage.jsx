import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TableLoader from '../components/loaders/TableLoader';
import Pagination from '../components/Pagination';
import CustomersAPI from '../services/customersAPI';

const CustomersPage = (props) => {
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            const data = await CustomersAPI.findAll();
            setCustomers(data);
            setLoading(false);
        } catch(error) {
            toast.error("Une erreur est survenue lors du chargement.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async id => {
        const originalCustomers = [...customers];
        setCustomers(customers.filter(customer => customer.id !== id));
        try {
            await CustomersAPI.delete(id);
            toast.success("Le client a bien été supprimé.", {
                position: toast.POSITION.TOP_CENTER
            });
        } catch(error) {
            setCustomers(originalCustomers);
            toast.error("Une erreur est survenue lors de la suppression.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
    };

    const handlePageChange = page => setCurrentPage(page);

    const handleSearch = ({ currentTarget }) => {
        setSearch(currentTarget.value);
        setCurrentPage(1);
    };

    const itemsPerPage = 8;

    const filteredCustomers = customers.filter(c => c.firstName.toLowerCase().includes(search.toLowerCase()) || c.lastName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || (c.company && c.company.toLowerCase().includes(search.toLowerCase())));

    const paginatedCustomers = Pagination.getData(filteredCustomers, currentPage, itemsPerPage);

    return (
        <>
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h1>Liste des clients</h1>
                <Link to="/customers/new" className='btn btn-primary'>Créer un client</Link>
            </div>

            <div className="form-group">
                <input type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher ..." />
            </div>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Id.</th>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Entreprise</th>
                        <th className='text-center'>Factures</th>
                        <th className='text-center'>Montant total</th>
                        <th></th>
                    </tr>
                </thead>
                { !loading && (
                    <tbody>
                        {paginatedCustomers.map(customer => 
                            <tr key={customer.id}>
                                <td> {customer.id} </td>
                                <td>
                                    <Link to={"/customers/" + customer.id }>{customer.firstName} {customer.lastName}</Link>
                                </td>
                                <td> {customer.email} </td>
                                <td>{customer.company}</td>
                                <td className='text-center'>
                                    <span className="badge bg-success">
                                        {customer.invoices.length}
                                    </span>
                                </td>
                                <td className='text-center'>{customer.totalAmount.toLocaleString()} €</td>
                                <td>
                                    <button onClick={() => handleDelete(customer.id)} disabled={customer.invoices.length > 0} className="btn btn-sm btn-danger">Supprimer</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                ) }
            </table>
            
            { loading && <TableLoader /> }

            {itemsPerPage < filteredCustomers.length && <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} length={filteredCustomers.length} onPageChanged={handlePageChange} />}
        </>
     );
}
 
export default CustomersPage;