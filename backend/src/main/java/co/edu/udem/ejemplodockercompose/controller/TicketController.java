package co.edu.udem.ejemplodockercompose.controller;

import co.edu.udem.ejemplodockercompose.model.Ticket;
import co.edu.udem.ejemplodockercompose.service.TicketAppService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/tickets")
public class TicketController {
    private final TicketAppService tickets;

    public TicketController(TicketAppService tickets) { this.tickets = tickets; }

    @GetMapping
    public List<Ticket> findAll() { return tickets.findAll(); }

    @PostMapping
    public Ticket create(@RequestBody CreateTicketRequest req) {
        var mapped = req.items().stream()
                .map(i -> new TicketAppService.ItemInput(i.productId(), i.quantity(), i.unitPrice()))
                .toList();
        return tickets.create(mapped);
    }

    public record CreateTicketRequest(List<Item> items) {}
    public record Item(Long productId, int quantity, BigDecimal unitPrice) {}
}


