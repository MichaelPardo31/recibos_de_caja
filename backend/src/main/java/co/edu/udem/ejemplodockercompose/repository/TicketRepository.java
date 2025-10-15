package co.edu.udem.ejemplodockercompose.repository;

import co.edu.udem.ejemplodockercompose.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {}


