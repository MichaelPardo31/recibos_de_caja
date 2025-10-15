package co.edu.udem.ejemplodockercompose.service;

import co.edu.udem.ejemplodockercompose.model.Product;
import co.edu.udem.ejemplodockercompose.model.Ticket;
import co.edu.udem.ejemplodockercompose.model.TicketItem;
import co.edu.udem.ejemplodockercompose.repository.ProductRepository;
import co.edu.udem.ejemplodockercompose.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketAppService {
    private final TicketRepository ticketRepository;
    private final ProductRepository productRepository;
    private final ProductAppService productAppService;

    public TicketAppService(TicketRepository ticketRepository, ProductRepository productRepository, ProductAppService productAppService) {
        this.ticketRepository = ticketRepository;
        this.productRepository = productRepository;
        this.productAppService = productAppService;
    }

    public List<Ticket> findAll() { return ticketRepository.findAll(); }

    @Transactional
    public Ticket create(List<ItemInput> items) {
        if (items == null || items.isEmpty()) throw new IllegalArgumentException("Sin items");
        Ticket t = new Ticket();
        List<TicketItem> entityItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (ItemInput it : items) {
            Product p = productRepository.findById(it.productId()).orElseThrow();
            if (p.getStock() < it.quantity()) throw new IllegalArgumentException("Stock insuficiente");

            TicketItem ti = new TicketItem();
            ti.setTicket(t);
            ti.setProduct(p);
            ti.setQuantity(it.quantity());
            ti.setUnitPrice(it.unitPrice());
            ti.setSubtotal(it.unitPrice().multiply(BigDecimal.valueOf(it.quantity())));
            total = total.add(ti.getSubtotal());
            entityItems.add(ti);
        }

        // Descontar stock
        for (ItemInput it : items) {
            productAppService.decrementStockOrThrow(it.productId(), it.quantity());
        }

        t.setItems(entityItems);
        t.setTotal(total);
        return ticketRepository.save(t);
    }

    public record ItemInput(Long productId, int quantity, BigDecimal unitPrice) {}
}


